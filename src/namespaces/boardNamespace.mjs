import { joinBoardRooms } from "../rooms/boardRooms.mjs";
import { boardsEmitter } from '../emitters/boardEmitter.mjs';
import { initializeBoardListeners } from "../listeners/boardListeners.mjs";

const onSocketDisconnectedHandler = (msg) => {
  console.log('Socket disconnected: ', msg);
};

const onConnectionHandler = async (socket) => {
  const { token: { name: userName } } = socket.handshake?.auth || {};
  const sessionId = socket.nsp.name.split('/')[2];
  console.log(
    socket.id,
    "| user: ", userName, " connected to ",
    socket.nsp.name,
    " namespace - ",
    Date.now()
  );
  socket.on("disconnect", onSocketDisconnectedHandler);
  
  // Initialize board event listeners
  initializeBoardListeners(socket);

  // Join board rooms
  const joinedBoards = await joinBoardRooms(socket, sessionId);
  if(joinedBoards) {
    console.log('Board Rooms Joined');

    // Emit boards initial data
    boardsEmitter(socket, { boards: joinedBoards }); 
  } else {
    console.log('Board Rooms Not Joined');
  }
};

const createRoomHandler = (room) => {
  console.log(`room ${room} was created`);
};

const onRoomJoinHandler = (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
};

export const initBoardNamespace = (io, sessionId) => {
  const boardNamespace = io.of(`/board/${sessionId}`);
  boardNamespace.on("connection", onConnectionHandler);
  boardNamespace.adapter.on("create-room", createRoomHandler);
  boardNamespace.adapter.on("join-room", onRoomJoinHandler);
};
