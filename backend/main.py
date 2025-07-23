import os
import sys
import traceback

try:
    from run import app
    print("✅ Successfully imported app from run.py")
except Exception as e:
    print(f"❌ Error importing app: {e}")
    traceback.print_exc()
    sys.exit(1)

@app.route('/health')
def health_check():
    return {'status': 'healthy', 'message': 'Rockland backend is running on Cloud Run'}

@app.route('/')
def home():
    return {'message': 'Rockland API is online', 'status': 'ok', 'platform': 'Cloud Run'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"🌐 Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)