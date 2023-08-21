import { initBoardNamespace } from './boardNamespace.mjs';

export const initializeNamespaces = ({io, sessionId}) => {
    initBoardNamespace(io, sessionId);
};