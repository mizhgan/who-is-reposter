import React, { useRef, useEffect, useCallback } from 'react';
import { 
  CANVAS_SIZE, 
  PADDLE_WIDTH, 
  PADDLE_OFFSET, 
  BALL_RADIUS, 
  INITIAL_SPEED, 
  MAX_SPEED, 
  GOAL_WIDTH, 
  CHAR_CONFIG, 
  ACCORDION_EMOJI,
  WALL_THICKNESS
} from '../constants';
import { CharacterType, BallState, Particle } from '../types';

interface GameProps {
  playerChar: CharacterType;
  onGameOver: (winner: 'PLAYER' | 'CPU') => void;
}

const Game: React.FC<GameProps> = ({ playerChar, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // CPU Character is the opposite
  const cpuChar = playerChar === CharacterType.BIRDY ? CharacterType.BLACKMAN : CharacterType.BIRDY;

  // Game State Mutable Refs (for performance without re-renders)
  const playerX = useRef(CANVAS_SIZE / 2);
  const cpuX = useRef(CANVAS_SIZE / 2);
  const ball = useRef<BallState>({
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2,
    vx: 0,
    vy: 0,
    rotation: 0,
    radius: BALL_RADIUS,
  });
  
  const particles = useRef<Particle[]>([]);
  const score = useRef({ player: 0, cpu: 0 });
  const isPaused = useRef(false);
  
  // Mouse/Touch tracking
  const handleInput = useCallback((clientX: number, rect: DOMRect) => {
    const relativeX = clientX - rect.left;
    const scaleX = CANVAS_SIZE / rect.width;
    const canvasX = relativeX * scaleX;
    
    // Clamp paddle within walls
    const minX = PADDLE_WIDTH / 2 + WALL_THICKNESS;
    const maxX = CANVAS_SIZE - PADDLE_WIDTH / 2 - WALL_THICKNESS;
    
    playerX.current = Math.max(minX, Math.min(maxX, canvasX));
  }, []);

  const resetBall = (winner?: 'PLAYER' | 'CPU') => {
    ball.current.x = CANVAS_SIZE / 2;
    ball.current.y = CANVAS_SIZE / 2;
    ball.current.rotation = 0;
    
    // Ball starts moving towards the loser (or random if first start)
    const direction = winner === 'PLAYER' ? -1 : 1; // -1 Up (to CPU), 1 Down (to Player)
    const angle = (Math.random() - 0.5) * 1.5; // Slight random angle
    
    ball.current.vx = Math.sin(angle) * INITIAL_SPEED;
    ball.current.vy = Math.cos(angle) * INITIAL_SPEED * direction;
  };

  const createParticles = (x: number, y: number, color: string, count: number = 10) => {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color,
      });
    }
  };

  const update = () => {
    if (isPaused.current) return;

    // 1. Move Ball
    const b = ball.current;
    b.x += b.vx;
    b.y += b.vy;
    b.rotation += (Math.abs(b.vx) + Math.abs(b.vy)) * 0.02;

    // 2. CPU AI
    // Simple tracking with speed limit
    const cpuTargetX = b.y < CANVAS_SIZE / 2 ? b.x : CANVAS_SIZE / 2; // Return to center if ball is on player side
    const cpuDiff = cpuTargetX - cpuX.current;
    const cpuSpeed = 6; // CPU Speed
    
    // Add some error to CPU if ball is moving fast
    const errorMargin = Math.abs(b.vy) > 12 ? 20 : 0;
    
    if (Math.abs(cpuDiff) > 5) {
      cpuX.current += Math.sign(cpuDiff) * Math.min(Math.abs(cpuDiff), cpuSpeed);
    }
    
    // Clamp CPU
    const minX = PADDLE_WIDTH / 2 + WALL_THICKNESS;
    const maxX = CANVAS_SIZE - PADDLE_WIDTH / 2 - WALL_THICKNESS;
    cpuX.current = Math.max(minX, Math.min(maxX, cpuX.current + (Math.random() - 0.5) * errorMargin));

    // 3. Wall Collisions (Left/Right)
    if (b.x - b.radius < WALL_THICKNESS) {
      b.x = WALL_THICKNESS + b.radius;
      b.vx = -b.vx;
      createParticles(b.x, b.y, '#fff', 5);
    } else if (b.x + b.radius > CANVAS_SIZE - WALL_THICKNESS) {
      b.x = CANVAS_SIZE - WALL_THICKNESS - b.radius;
      b.vx = -b.vx;
      createParticles(b.x, b.y, '#fff', 5);
    }

    // 4. Paddle & Goal Collisions
    
    // Player Paddle Y position (Bottom)
    const playerY = CANVAS_SIZE - PADDLE_OFFSET;
    // CPU Paddle Y position (Top)
    const cpuY = PADDLE_OFFSET;

    // Check Player Collision (Bottom)
    if (b.y + b.radius >= playerY - 10 && b.y - b.radius <= playerY + 10) {
      if (Math.abs(b.x - playerX.current) < PADDLE_WIDTH / 2 + b.radius) {
        // Hit Player Paddle
        b.y = playerY - 10 - b.radius;
        b.vy = -Math.abs(b.vy * 1.05); // Speed up slightly
        // Add "English" based on where it hit the paddle
        const hitPoint = b.x - playerX.current;
        b.vx += hitPoint * 0.15;
        
        // Cap speed
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > MAX_SPEED) {
          const ratio = MAX_SPEED / speed;
          b.vx *= ratio;
          b.vy *= ratio;
        }
        createParticles(b.x, b.y, CHAR_CONFIG[playerChar].color);
      }
    }

    // Check CPU Collision (Top)
    if (b.y - b.radius <= cpuY + 10 && b.y + b.radius >= cpuY - 10) {
      if (Math.abs(b.x - cpuX.current) < PADDLE_WIDTH / 2 + b.radius) {
        // Hit CPU Paddle
        b.y = cpuY + 10 + b.radius;
        b.vy = Math.abs(b.vy * 1.05);
        
        const hitPoint = b.x - cpuX.current;
        b.vx += hitPoint * 0.15;
        
        // Cap speed
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > MAX_SPEED) {
          const ratio = MAX_SPEED / speed;
          b.vx *= ratio;
          b.vy *= ratio;
        }
        createParticles(b.x, b.y, CHAR_CONFIG[cpuChar].color);
      }
    }

    // 5. Goal / Out of Bounds Logic
    const goalLeft = (CANVAS_SIZE - GOAL_WIDTH) / 2;
    const goalRight = (CANVAS_SIZE + GOAL_WIDTH) / 2;

    // Top Wall (CPU Side)
    if (b.y - b.radius < 0) {
      if (b.x > goalLeft && b.x < goalRight) {
        // GOAL for Player!
        score.current.player++;
        createParticles(b.x, 0, '#ffff00', 30);
        checkWin();
        resetBall('PLAYER');
      } else {
        // Bounce off back wall
        b.y = b.radius;
        b.vy = -b.vy;
        createParticles(b.x, 0, '#888', 5);
      }
    }

    // Bottom Wall (Player Side)
    if (b.y + b.radius > CANVAS_SIZE) {
      if (b.x > goalLeft && b.x < goalRight) {
        // GOAL for CPU!
        score.current.cpu++;
        createParticles(b.x, CANVAS_SIZE, '#ff0000', 30);
        checkWin();
        resetBall('CPU');
      } else {
        // Bounce off back wall
        b.y = CANVAS_SIZE - b.radius;
        b.vy = -b.vy;
        createParticles(b.x, CANVAS_SIZE, '#888', 5);
      }
    }
    
    // Update Particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) particles.current.splice(i, 1);
    }
  };

  const checkWin = () => {
    if (score.current.player >= 5) {
      onGameOver('PLAYER');
      isPaused.current = true;
    } else if (score.current.cpu >= 5) {
      onGameOver('CPU');
      isPaused.current = true;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Field Pattern
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_SIZE / 2);
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Goals (Holes)
    const goalLeft = (CANVAS_SIZE - GOAL_WIDTH) / 2;
    ctx.fillStyle = '#000';
    // Top Goal
    ctx.fillRect(goalLeft, 0, GOAL_WIDTH, 20);
    // Bottom Goal
    ctx.fillRect(goalLeft, CANVAS_SIZE - 20, GOAL_WIDTH, 20);
    
    // Draw Goal Highlights
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0f0';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.fillRect(goalLeft, 0, GOAL_WIDTH, 20);
    ctx.fillRect(goalLeft, CANVAS_SIZE - 20, GOAL_WIDTH, 20);
    ctx.shadowBlur = 0;

    // Draw Paddles
    
    // CPU Paddle
    ctx.fillStyle = CHAR_CONFIG[cpuChar].paddleColor;
    ctx.fillRect(cpuX.current - PADDLE_WIDTH / 2, PADDLE_OFFSET - 10, PADDLE_WIDTH, 20);
    // CPU Avatar
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(CHAR_CONFIG[cpuChar].emoji, cpuX.current, PADDLE_OFFSET - 30);

    // Player Paddle
    ctx.fillStyle = CHAR_CONFIG[playerChar].paddleColor;
    ctx.fillRect(playerX.current - PADDLE_WIDTH / 2, CANVAS_SIZE - PADDLE_OFFSET - 10, PADDLE_WIDTH, 20);
    // Player Avatar
    ctx.fillText(CHAR_CONFIG[playerChar].emoji, playerX.current, CANVAS_SIZE - PADDLE_OFFSET + 30);

    // Draw Ball (Accordion)
    const b = ball.current;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ACCORDION_EMOJI, 0, 4); // Slight offset for emoji centering
    ctx.restore();

    // Draw Particles
    particles.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Score
    ctx.font = '80px "Press Start 2P"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score.current.cpu}`, CANVAS_SIZE / 4, CANVAS_SIZE / 2 - 60);
    ctx.fillText(`${score.current.player}`, CANVAS_SIZE / 4, CANVAS_SIZE / 2 + 60);
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        update();
        draw(ctx);
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    resetBall();
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg aspect-square bg-gray-900 rounded-lg shadow-2xl overflow-hidden border-4 border-gray-700">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full h-full cursor-none touch-none"
        onMouseMove={(e) => {
           const rect = e.currentTarget.getBoundingClientRect();
           handleInput(e.clientX, rect);
        }}
        onTouchMove={(e) => {
           const rect = e.currentTarget.getBoundingClientRect();
           handleInput(e.touches[0].clientX, rect);
        }}
      />
      <div className="absolute top-4 left-4 text-white opacity-50 pointer-events-none font-arcade text-xs">
        OPPONENT: {CHAR_CONFIG[cpuChar].name.toUpperCase()}
      </div>
      <div className="absolute bottom-4 right-4 text-white opacity-50 pointer-events-none font-arcade text-xs">
        YOU: {CHAR_CONFIG[playerChar].name.toUpperCase()}
      </div>
    </div>
  );
};

export default Game;