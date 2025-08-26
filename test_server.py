from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def root():
    return jsonify({'status': 'running', 'message': 'Test server is working'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'message': 'Test server is healthy'})

if __name__ == '__main__':
    print("Test server starting on http://localhost:9999")
    app.run(debug=False, host='0.0.0.0', port=9999)
