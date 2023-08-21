import { Server } from "socket.io";

export class SocketIoServer {
    static server = null;
    
    static getServer(httpServer) {
        if(!SocketIoServer.server && httpServer) {
            SocketIoServer.server = new Server(httpServer);
        }
        return SocketIoServer.server;
    }
};