import socketio
import eventlet
import time

# Create a Socket.IO server instance
sio = socketio.Server(cors_allowed_origins="*")

# Create a WSGI application to wrap the Socket.IO server
app = socketio.WSGIApp(sio)

sids_web = set()

# Define a Socket.IO event handler
@sio.event
def connect(sid, environ):
    print(f"Client connected")

@sio.event
def disconnect(sid):
    if(sid in sids_web):
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
        print("Signal sent to client: ", sid)
        sio.emit('hart_beat_event', data, room=sid)


if __name__ == "__main__":
    # Create a Socket.IO server and bind it to localhost:3000
    eventlet.wsgi.server(eventlet.listen(('localhost', 3000)), app)
