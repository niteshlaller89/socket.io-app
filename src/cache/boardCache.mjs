import { redisCache } from "./client.mjs";

export const KEYS = {
    BOARDS: (sessionId) => `dev:boardservice:board:${sessionId}`,
    BOARD_SELECTED_ID: (sessionId, userId) => `dev:boardservice:board:selected:${sessionId}:${userId}`,
    BOARD_PATHS: (boardId, sessionId) => `dev:boardservice:paths:${sessionId}:${boardId}`,
};

export const getSessionBoards = async (sessionId) => {
    const client = redisCache.client;
    const sessionBoards = await client.hgetall(KEYS.BOARDS(sessionId));
    return sessionBoards;
} 