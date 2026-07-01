import subprocess
import sys
import os
import time

def start_app():
    print("=================================================================")
    print("     Smart CBC Report Analysis and Health Suggestion System      ")
    print("=================================================================")
    
    # 1. Start the Flask backend server
    backend_script = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend', 'app.py'))
    print("[1/2] Launching Flask backend server...")
    backend_process = subprocess.Popen([sys.executable, backend_script])
    
    # Give the backend server a moment to spin up
    time.sleep(1.5)
    
    # 2. Start the frontend HTTP server
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'frontend'))
    print("[2/2] Launching frontend server on http://localhost:8080...")
    frontend_process = subprocess.Popen([
        sys.executable, '-m', 'http.server', '8080', '--directory', frontend_dir
    ])
    
    # 3. Automatically open user's web browser to the frontend page
    try:
        import webbrowser
        time.sleep(0.5)
        webbrowser.open("http://localhost:8080")
    except Exception:
        pass
        
    print("\nSmart CBC System is running successfully!")
    print(" -> Frontend: http://localhost:8080")
    print(" -> Backend:  http://127.0.0.1:5000")
    print("\nPress Ctrl+C in this terminal to terminate both servers.")
    
    try:
        # Keep monitoring process lifecycles
        while True:
            time.sleep(1)
            if backend_process.poll() is not None:
                print("\nBackend server stopped.")
                break
            if frontend_process.poll() is not None:
                print("\nFrontend server stopped.")
                break
    except KeyboardInterrupt:
        print("\nShutting down both servers...")
    finally:
        # Terminate processes cleanly
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("Servers stopped successfully.")

if __name__ == '__main__':
    start_app()
