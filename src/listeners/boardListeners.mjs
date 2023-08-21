import * as uuid from 'uuid';
import { EVENTS } from "../constants.mjs";
import { KEYS } from "../cache/boardCache.mjs";
import { redisCache } from "../cache/client.mjs";
import { ROOMS } from "../rooms/boardRooms.mjs";
import { SocketIoServer } from "../socketIoServer.mjs";

const boardSubscribeListener = async (socket) => {
    socket.on(EVENTS.BOARD_SUBSCRIBE, async (payload, callback) => {
        const client = redisCache.client;
        const {id: boardId} = payload || {};
        console.log('Event: ', EVENTS.BOARD_SUBSCRIBE, ' id: ', boardId);
        const paths = await client.lrange(KEYS.BOARD_PATHS(boardId, socket.nsp.name.split('/')[2]), 0, -1);
        callback({paths: paths, pointers: [], images: []});
    });
};

const boardPathListeners = async (socket) => {
    socket.on(EVENTS.BOARD_PATH_CREATED, async (payload, callback) => {
        const client = redisCache.client;
        const { token: { name: userName } } = socket.handshake?.auth || {};
        const {id: pathId, boardId } = payload || {};
        console.log('Board: ', boardId ,' Path saved: ', EVENTS.BOARD_PATH_CREATED, ' id: ', pathId);
        await client.lpush(KEYS.BOARD_PATHS(boardId, socket.nsp.name.split('/')[2]), JSON.stringify(payload));
        callback({id: pathId});

        const board = JSON.parse(await client.hget(KEYS.BOARDS(socket.nsp.name.split('/')[2]), boardId) || {});
        if(board?.hidden) {
            socket.to(ROOMS.BOARD_HIDDEN_ROOM(boardId)).emit(EVENTS.BOARD_PATH_CREATED, { ...payload, userName });
        } else {
            socket.to(ROOMS.BOARD_VISIBLE_ROOM(boardId)).emit(EVENTS.BOARD_PATH_CREATED, { ...payload, userName });
        }
    });
};

const boardCreateListener = async (socket) => {
    socket.on(EVENTS.BOARD_CREATED, async (board, callback) => {
        const client = redisCache.client;
        const sessionId = socket.nsp.name.split('/')[2];
        const boardId = uuid.v4();
        await client.hset(KEYS.BOARDS(sessionId), boardId, JSON.stringify({id: boardId, ...board}));
        callback({id: boardId});
        const io = SocketIoServer.getServer();

        io.of(socket.nsp.name).in(ROOMS.BOARD_INFO_ROOM(sessionId)).socketsJoin(ROOMS.BOARD_VISIBLE_ROOM(boardId));
        io.of(socket.nsp.name).in(ROOMS.BOARD_MODERATOR_ROOM(sessionId)).socketsJoin(ROOMS.BOARD_HIDDEN_ROOM(boardId));

        if(board?.hidden) {
            io.of(socket.nsp.name).in(ROOMS.BOARD_MODERATOR_ROOM(sessionId)).emit(EVENTS.BOARD_CREATED, {id: boardId, ...board});
        } else {
            io.of(socket.nsp.name).in(ROOMS.BOARD_INFO_ROOM(sessionId)).emit(EVENTS.BOARD_CREATED, {id: boardId, ...board});
        }
    });
};

export const initializeBoardListeners = (socket) => {
    boardSubscribeListener(socket);
    boardPathListeners(socket);
    boardCreateListener(socket);
};