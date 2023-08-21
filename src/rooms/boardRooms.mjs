import { ROLES } from "../constants.mjs";
import { getSessionBoards } from "../cache/boardCache.mjs";

export const ROOMS = {
    BOARD_INFO_ROOM: (sessionId) => `board-${sessionId}`,
    BOARD_HIDDEN_ROOM: (boardId) => `board-${boardId}-hidden`,
    BOARD_VISIBLE_ROOM: (boardId) => `board-${boardId}-visible`,
    BOARD_MODERATOR_ROOM: (sessionId) => `board-${sessionId}-moderator`,
};


export const joinBoardRooms = async (socket, sessionId) => {
    const joinedBoards = [];
    const { role }  = socket.handshake.auth.token || {};

    // Join board info room (for create/update/delete)
    socket.join(ROOMS.BOARD_INFO_ROOM(sessionId));
    
    // Get all session boards and subscribe each of them.
    const boards = await getSessionBoards(sessionId);
    Object.values(boards).forEach((b) => {
        const board = b ? JSON.parse(b): {};
        // Join hidden & moderator board Room (only for moderators)
        const { id: boardId } = board;
        if ((role === ROLES.HOST || role === ROLES.OPERATOR) && boardId) {
            socket.join(ROOMS.BOARD_HIDDEN_ROOM(board.id));
        }
        // Join visible board room (for all)
        if(boardId) {
            socket.join(ROOMS.BOARD_VISIBLE_ROOM(board.id));
        }
        joinedBoards.push(board);
    });

    // Join moderator board Room (only for moderators)
    if (role === ROLES.HOST || role === ROLES.OPERATOR) {
        socket.join(ROOMS.BOARD_MODERATOR_ROOM(sessionId));
    }

    return joinedBoards;
};