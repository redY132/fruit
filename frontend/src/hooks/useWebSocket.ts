// Multiplayer WebSocket connection + message dispatch
// TODO: connect to Spring Boot WS endpoint, dispatch game events
export function useWebSocket(_url: string) {
  return { connected: false, send: (_msg: unknown) => {} };
}
