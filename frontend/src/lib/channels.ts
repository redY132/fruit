export function lobbyChannel(lobbyId: string): string {
  return `lobby:${lobbyId}`
}

export function gameChannel(lobbyId: string): string {
  return `game:${lobbyId}`
}

export const GameEvent = {
  SliceResult:      'slice_result',
  BombInject:       'bomb_inject',
  ScoreUpdate:      'score_update',
  PlayerEliminated: 'player_eliminated',
} as const
export type GameEvent = typeof GameEvent[keyof typeof GameEvent]

export const LobbyEvent = {
  PlayerJoined: 'player_joined',
  PlayerReady:  'player_ready',
  MatchStart:   'match_start',
} as const
export type LobbyEvent = typeof LobbyEvent[keyof typeof LobbyEvent]
