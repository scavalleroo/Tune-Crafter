import { io } from 'socket.io-client';

const ipAddress = import.meta.env.VITE_IP_ADDRESS_SERVER_SOCKET;
const port = import.meta.env.VITE_PORT_SERVER_SOCKET;

let url = "http://" + ipAddress + ":" + port + "/";
export const socket = io(url, {autoConnect: false});