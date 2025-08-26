// Content script for LeetCode Solution Saver
class LeetCodeDetector {
    constructor() {
      this.lastSubmissionStatus = null;
      this.currentQuestion = null;
      this.solutionCode = null;
      this._lastHref = location.href;
      this.init();
    }
  
    init() {
      // First load
      this.hydrateQuestionInfoWithRetry();
  
      // Observe submission panel / DOM changes
      this.setupSubmissionObserver();
  
      // Keep scraping editor text as a fallback
      this.setupCodeExtraction();
  
      // React SPA route changes: re-hydrate on URL change
      this.setupRouteChangeWatcher();
  
      console.log("LeetCode Solution Saver: Initialized");
    }
  
    // ---------- Robust question info ----------
  
    getSlugFromLocation() {
      // Handles /problems/<slug>/, /problems/<slug>/description/,
      // /problems/<slug>/submissions/, etc.
      const m = location.pathname.match(/\/problems\/([^/]+)/);
      return m ? m[1] : null;
    }
  
    async hydrateQuestionInfoWithRetry(retries = 8, interval = 400) {
      for (let i = 0; i < retries; i++) {
        const ok = await this.extractQuestionInfo();
        if (ok) return;
        await new Promise(r => setTimeout(r, interval));
      }
      console.error("Failed to extract question info after maximum retries.", {
        url: location.href
      });
    }
  
    async extractQuestionInfo() {
      const slug = this.getSlugFromLocation();
      if (!slug) {
        console.error("Could not extract slug from URL:", location.href);
        return false;
      }
  
      // Always start with at least the slug so downstream never sees null
      this.currentQuestion = { slug };
  
      // Try GraphQL for richer data
      try {
        const q = await fetchQuestionMeta(slug);
        if (q) {
          this.currentQuestion = {
            number: q.questionId,     // numeric string
            title: q.title,
            slug: q.titleSlug || slug,
            difficulty: q.difficulty
          };
          console.log("Question detected:", this.currentQuestion);
          return true;
        }
        // GraphQL returned nothing; keep slug-only object
        console.warn("No question data found for slug (GraphQL null). Using slug only:", slug);
        return true;
      } catch (err) {
        console.warn("GraphQL question fetch failed; using slug only.", err);
        return true;
      }
    }
  
    // ---------- SPA route change watcher ----------
  
    setupRouteChangeWatcher() {
      const onChange = () => {
        if (this._lastHref !== location.href) {
          this._lastHref = location.href;
          // Reset state tied to a specific problem
          this.lastSubmissionStatus = null;
          this.solutionCode = null;
          this.hydrateQuestionInfoWithRetry();
        }
      };
  
      // Patch history API
      const _push = history.pushState;
      history.pushState = function (...args) {
        const ret = _push.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
        return ret;
      };
      const _replace = history.replaceState;
      history.replaceState = function (...args) {
        const ret = _replace.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
        return ret;
      };
  
      window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")));
      window.addEventListener("locationchange", onChange);
  
      // Also poll as a safety net (some frameworks bypass history events)
      setInterval(onChange, 800);
    }
  
    // ---------- Submission detection ----------
  
    setupSubmissionObserver() {
      const observer = new MutationObserver(() => {
        // Debounce a bit to let DOM settle
        clearTimeout(this._statusDebounce);
        this._statusDebounce = setTimeout(() => this.checkSubmissionStatus(), 150);
      });
  
      const submissionArea =
        document.querySelector('[data-cy="submission-result"]') ||
        document.querySelector(".submission-result") ||
        document.body;
  
      observer.observe(submissionArea, { childList: true, subtree: true });
    }
  
    checkSubmissionStatus() {
      const successSelectors = [
        '.text-green-s',
        '.text-success',
        '[data-cy="submission-success"]',
        '.success-message',
        '.accepted'
      ];
  
      let accepted = false;
      for (const sel of successSelectors) {
        const el = document.querySelector(sel);
        if (el && /accepted/i.test(el.textContent || "")) {
          accepted = true;
          break;
        }
      }
  
      if (accepted && this.lastSubmissionStatus !== "success") {
        this.lastSubmissionStatus = "success";
        this.onSuccessfulSubmission();
      } else if (!accepted) {
        this.lastSubmissionStatus = "not-success";
      }
    }
  
    // ---------- Code scraping (fallback only) ----------
  
    setupCodeExtraction() {
      const extractCode = () => {
        const codeEditor =
          document.querySelector(".monaco-editor") ||
          document.querySelector(".ace_editor") ||
          document.querySelector('[data-cy="code-editor"]');
  
        if (!codeEditor) return;
  
        // Monaco
        if (window.monaco?.editor) {
          const editor = window.monaco.editor.getEditors()[0];
          if (editor) {
            this.solutionCode = editor.getValue();
            return;
          }
        }
        // Ace
        if (window.ace?.edit) {
          const editor = window.ace.edit(codeEditor);
          if (editor) {
            this.solutionCode = editor.getValue();
            return;
          }
        }
        // Fallback
        const codeEl =
          codeEditor.querySelector("textarea") ||
          codeEditor.querySelector("pre") ||
          codeEditor;
        if (codeEl) this.solutionCode = codeEl.value || codeEl.textContent || "";
      };
  
      setInterval(extractCode, 2000);
      document.addEventListener("keydown", extractCode);
    }
  
    // ---------- Success handler ----------
  
    async onSuccessfulSubmission() {
      console.log("LeetCode Solution Saver: Successful submission detected!");
  
      // Ensure we have a slug; if not, try once more
      if (!this.currentQuestion?.slug) {
        await this.extractQuestionInfo();
      }
      if (!this.currentQuestion?.slug) {
        console.error("Missing question info:", { currentQuestion: this.currentQuestion, url: location.href });
        this.showNotification("Could not detect question info", "error");
        return;
      }
  
      // Get exact judged code via GraphQL (preferred), fallback to scraped code
      const latest = await fetchLatestSubmission(this.currentQuestion.slug);
  
      const solutionData = {
        questionNumber: this.currentQuestion.number || "N/A",
        questionTitle: this.currentQuestion.title || this.currentQuestion.slug,
        questionSlug: this.currentQuestion.slug,
        difficulty: this.currentQuestion.difficulty || "Unknown",
        code: latest?.code || this.solutionCode || "",
        language: latest?.lang || "unknown",
        timestamp: new Date().toISOString(),
        url: location.href
      };
  
      if (!solutionData.code) {
        console.error("No solution code available (API + editor empty).", solutionData);
        this.showNotification("No solution code available", "error");
        return;
      }
  
      chrome.runtime.sendMessage(
        { action: "solutionCompleted", data: solutionData },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError.message);
            this.showNotification("Failed to save solution: Runtime error", "error");
            return;
          }
          if (response?.success) {
            console.log("Solution saved successfully!");
            this.showNotification("Solution saved to GitHub!");
          } else {
            console.error("Failed to save solution:", response?.error || "Unknown error");
            this.showNotification(`Failed to save solution: ${response?.error || "Unknown error"}`, "error");
          }
        }
      );
    }
  
    // ---------- UI ----------
  
    showNotification(message, type = "success") {
      const n = document.createElement("div");
      n.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        padding: 10px 20px; border-radius: 5px;
        color: white; font-weight: bold; z-index: 10000;
        background-color: ${type === "success" ? "#4CAF50" : "#f44336"};
      `;
      n.textContent = message;
      document.body.appendChild(n);
      setTimeout(() => n.remove(), 3000);
    }
  }
  
  /* ---------------- GraphQL helpers ---------------- */
  
  async function fetchQuestionMeta(titleSlug) {
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          difficulty
        }
      }
    `;
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { titleSlug } })
    });
  
    if (!res.ok) {
      console.error("GraphQL question fetch failed:", res.status, res.statusText);
      return null;
    }
    const data = await res.json().catch(() => null);
    return data?.data?.question || null;
  }
  
  async function fetchLatestSubmission(titleSlug) {
    try {
      const query = `
        query recentSubmissionList($titleSlug: String!, $offset: Int!, $limit: Int!) {
          recentSubmissionList(titleSlug: $titleSlug, offset: $offset, limit: $limit) {
            statusDisplay
            lang
            code
            timestamp
          }
        }
      `;
      const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { titleSlug, offset: 0, limit: 1 } })
      });
      if (!res.ok) {
        console.error("GraphQL latest submission fetch failed:", res.status, res.statusText);
        return null;
      }
      const data = await res.json().catch(() => null);
      return data?.data?.recentSubmissionList?.[0] || null;
    } catch (err) {
      console.error("fetchLatestSubmission error:", err);
      return null;
    }
  }
  
  /* ---------------- Boot ---------------- */
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new LeetCodeDetector());
  } else {
    new LeetCodeDetector();
  }
  