import { KEYS } from "./cache/boardCache.mjs";

export const SESSIONS = {
  SESSION1: "sessionId1",
  SESSION2: "sessionID2",
};

const boards = {
  [SESSIONS.SESSION1]: [
    {
      id: "boardId1-1",
      settings: {
        bgColor: "black",
      },
      hidden: false
    },
    {
      id: "boardId1-2",
      settings: {
        bgColor: "black",
      },
      hidden: false
    },
  ],
  [SESSIONS.SESSION2]: [
    {
      id: "boardId2-1",
      settings: {
        bgColor: "white",
      },
      hidden: false
    },
    {
      id: "boardId2-2",
      settings: {
        bgColor: "black",
      },
      hidden: false
    },
  ],
};

export const initBoards = (redisClient) => {
    boards[SESSIONS.SESSION1].forEach((board) => {
        redisClient
            .hset(KEYS.BOARDS(SESSIONS.SESSION1), board.id, JSON.stringify(board))
            .catch((err) => console.log(err));
    }
  );
  
  boards[SESSIONS.SESSION2].forEach((board) =>
  redisClient
      .hset(KEYS.BOARDS(SESSIONS.SESSION2), board.id, JSON.stringify(board))
      .catch((err) => console.log(err))
  );
};

