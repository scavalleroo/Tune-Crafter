import socketio
import eventlet
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
dotenv_path = ".env"
try:
    load_dotenv(dotenv_path)
except Exception as e:
    print(f"Failed to load environment variables from {dotenv_path}: {e}")
    exit(1)

# Create a Socket.IO server instance
sio = socketio.Server(logger=True, engineio_logger=True, cors_allowed_origins="*")

# Create a WSGI application to wrap the Socket.IO server
app = socketio.WSGIApp(sio)

sids_web = set()

# Define a Socket.IO event handler
@sio.event
def connect(sid, environ):
    print(f"Client connected")

@sio.event
def disconnect(sid):
    if sid in sids_web:
        sids_web.remove(sid)
    print(f"Client disconnected")

@sio.event
def connect_web_client(sid):
    sids_web.add(sid)

@sio.event
def hart_beat_event(sid, data):
    print(f"Received custom event from: {data}")
    broadcast_to_clients_web(data)

def broadcast_to_clients_web(data):
    for sid in sids_web:
        print("Signal sent to client:", sid)
        sio.emit('hart_beat_event', data, room=sid)

if __name__ == "__main__":
    # Get server configuration from environment variables
    ip_address = os.getenv("VITE_IP_ADDRESS_SERVER_SOCKET")
    port = os.getenv("VITE_PORT_SERVER_SOCKET")

    if not (ip_address and port):
        print("Please define VITE_IP_ADDRESS_SERVER_SOCKET and VITE_PORT_SERVER_SOCKET in your .env file.")
        exit(1)

    try:
        port = int(port)
    except ValueError:
        print("Invalid port value in the .env file.")
        exit(1)

    print(f"Socket server running on {ip_address}:{port}")

    eventlet.wsgi.server(eventlet.listen((ip_address, port)), app)
