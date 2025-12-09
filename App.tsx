import React, { useState } from 'react';
import Game from './components/Game';
import { CharacterType, GameState } from './types';
import { CHAR_CONFIG } from './constants';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [playerChar, setPlayerChar] = useState<CharacterType>(CharacterType.BIRDY);
  const [winner, setWinner] = useState<'PLAYER' | 'CPU' | null>(null);

  const startGame = (char: CharacterType) => {
    setPlayerChar(char);
    setGameState(GameState.PLAYING);
    setWinner(null);
  };

  const handleGameOver = (win: 'PLAYER' | 'CPU') => {
    setWinner(win);
    setGameState(GameState.GAME_OVER);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
      {gameState === GameState.MENU && (
        <div className="max-w-md w-full bg-zinc-800 p-8 rounded-2xl shadow-xl border border-zinc-700 text-center space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-arcade text-yellow-400 leading-tight">
              WHO IS A <br/>REPOSTER?
            </h1>
            <p className="text-gray-400 text-sm">Bounce the Accordion. Defeat the Reposter.</p>
          </div>

          <div className="space-y-4">
            <p className="text-white font-bold tracking-wider">CHOOSE YOUR CHARACTER</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => startGame(CharacterType.BIRDY)}
                className="group relative bg-sky-900/50 hover:bg-sky-600 transition-all p-6 rounded-xl border-2 border-sky-500 flex flex-col items-center gap-2"
              >
                <span className="text-6xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform">
                  {CHAR_CONFIG[CharacterType.BIRDY].emoji}
                </span>
                <span className="font-arcade text-sky-200 text-xs mt-2">BIRDY</span>
              </button>

              <button
                onClick={() => startGame(CharacterType.BLACKMAN)}
                className="group relative bg-gray-900/50 hover:bg-gray-700 transition-all p-6 rounded-xl border-2 border-gray-500 flex flex-col items-center gap-2"
              >
                <span className="text-6xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform">
                  {CHAR_CONFIG[CharacterType.BLACKMAN].emoji}
                </span>
                <span className="font-arcade text-gray-200 text-xs mt-2">BLACKMAN</span>
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 font-mono">
            First to 5 points wins.
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
          <Game playerChar={playerChar} onGameOver={handleGameOver} />
          <div className="text-gray-400 text-sm animate-pulse">
            Slide to move. Protect your hole!
          </div>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="max-w-md w-full bg-zinc-800 p-8 rounded-2xl shadow-xl border-2 border-yellow-500 text-center space-y-6 animate-bounce-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-arcade text-white">GAME OVER</h2>
            <div className="text-6xl py-4">
              {winner === 'PLAYER' ? '🏆' : '🤡'}
            </div>
            <p className="text-xl font-bold text-yellow-400">
              {winner === 'PLAYER' 
                ? "YOU ARE THE ORIGINAL POSTER!" 
                : "YOU ARE A REPOSTER!"}
            </p>
            <p className="text-gray-400 text-sm">
              {winner === 'PLAYER' 
                ? `You defeated ${CHAR_CONFIG[playerChar === CharacterType.BIRDY ? CharacterType.BLACKMAN : CharacterType.BIRDY].name}!`
                : `${CHAR_CONFIG[playerChar === CharacterType.BIRDY ? CharacterType.BLACKMAN : CharacterType.BIRDY].name} stole your content.`}
            </p>
          </div>

          <button
            onClick={() => setGameState(GameState.MENU)}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-arcade text-sm rounded-lg transition-colors font-bold shadow-lg"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
