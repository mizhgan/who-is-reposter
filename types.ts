export enum CharacterType {
  BIRDY = 'BIRDY',
  BLACKMAN = 'BLACKMAN',
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface PlayerState {
  x: number;
  width: number;
  score: number;
  character: CharacterType;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  radius: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface GameConfig {
  playerChar: CharacterType;
  difficulty: 'EASY' | 'HARD';
}
