import { CharacterType } from './types';

// Canvas Dimensions (Internal Resolution)
export const CANVAS_SIZE = 800;
export const WALL_THICKNESS = 20;
export const GOAL_WIDTH = 250;

// Paddle
export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 80; // Visual height for the character
export const PADDLE_OFFSET = 60; // Distance from edge

// Ball
export const BALL_RADIUS = 25;
export const INITIAL_SPEED = 8;
export const MAX_SPEED = 18;
export const SPEED_INCREMENT = 0.5;

// Physics
export const FRICTION = 0.98;
export const ROTATION_SPEED = 0.1;

// Colors & Assets
export const CHAR_CONFIG = {
  [CharacterType.BIRDY]: {
    name: 'Birdy',
    emoji: '🐦',
    color: '#38bdf8', // Sky blue
    paddleColor: '#0ea5e9',
  },
  [CharacterType.BLACKMAN]: {
    name: 'Blackman',
    emoji: '🕵️‍♂️',
    color: '#1f2937', // Dark gray
    paddleColor: '#374151',
  }
};

export const ACCORDION_EMOJI = '🪗';
export const FIELD_COLOR = '#4ade80'; // Grass green-ish
export const FIELD_ACCENT = '#22c55e';
