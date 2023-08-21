import { EVENTS } from "../constants.mjs";


export const boardsEmitter = (socket, payload) => {
    socket.emit(EVENTS.BOARDS, payload);
}