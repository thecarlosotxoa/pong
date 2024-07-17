// src/Pong.js
import React, { useState, useEffect, useRef } from 'react';
import './Pong.css';

const Pong = () => {
  const canvasRef = useRef(null);
  const [paddleX, setPaddleX] = useState(50); // Initial position of the paddle
  const [ballX, setBallX] = useState(50); // Initial x position of the ball
  const [ballY, setBallY] = useState(50); // Initial y position of the ball
  const [ballDX, setBallDX] = useState(0.5); // Initial x velocity of the ball
  const [ballDY, setBallDY] = useState(0.5); // Initial y velocity of the ball
  const [bounceCount, setBounceCount] = useState(0); // Number of times the ball has bounced
  const [gameOver, setGameOver] = useState(false); // Flag indicating game over state
  const [paused, setPaused] = useState(false); // Flag indicating if the game is paused
  const [startTime, setStartTime] = useState(Date.now()); // Start time of the game
  const [selectingStartPoint, setSelectingStartPoint] = useState(true); // Flag indicating if selecting start point of the ball
  const [movingLeft, setMovingLeft] = useState(false); // Flag indicating if paddle is moving left
  const [movingRight, setMovingRight] = useState(false); // Flag indicating if paddle is moving right

  const paddleWidth = 20; // Width of the paddle
  const paddleHeight = 2; // Height of the paddle
  const ballSize = 2; // Size of the ball

  // Function to update the game state
  const update = () => {
    if (gameOver || paused || selectingStartPoint) return;

    let newBallX = ballX + ballDX;
    let newBallY = ballY + ballDY;

    // Bounce off the walls
    if (newBallX < 0 || newBallX > 100 - ballSize) {
      setBallDX(-ballDX);
    }
    // Bounce off the ceiling
    if (newBallY < 0) {
      setBallDY(-ballDY);
    }
    // Check paddle collision or game over
    if (newBallY > 100 - ballSize) {
      if (newBallX >= paddleX && newBallX <= paddleX + paddleWidth) {
        setBallDY(-ballDY);
        incrementBounceCount();
        // Add variability to ball direction
        setBallDX(ballDX + (Math.random() - 0.5) * 0.2); // Adjust the randomness as needed
      } else {
        setGameOver(true);
      }
    }

    setBallX(newBallX);
    setBallY(newBallY);
  };

  // Function to increase bounce count and adjust ball speed
  const incrementBounceCount = () => {
    setBounceCount(bounceCount + 1);
    if (bounceCount > 0 && (bounceCount + 1) % 4 === 0) {
      setBallDX(ballDX * 1.2);
      setBallDY(ballDY * 1.2);
    }
  };

  // Function to reset the game state
  const resetGame = () => {
    setPaddleX(50);
    setBallX(50);
    setBallY(50);
    setBallDX(0.5);
    setBallDY(0.5);
    setBounceCount(0);
    setGameOver(false);
    setPaused(false);
    setStartTime(Date.now());
    setSelectingStartPoint(true);
    setMovingLeft(false);
    setMovingRight(false);
  };

  // Effect to update the game state on an interval
  useEffect(() => {
    const interval = setInterval(update, 20);
    return () => clearInterval(interval);
  }, [ballX, ballY, ballDX, ballDY, gameOver, paused, selectingStartPoint]);

  // Effect to handle keyboard input for paddle movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'p') {
        setPaused(!paused); // Toggle pause state with 'p' key
      }
      if (gameOver || selectingStartPoint) return;

      // Move paddle with single key stroke
      if (e.key === 'ArrowLeft') {
        movePaddleLeft();
      } else if (e.key === 'ArrowRight') {
        movePaddleRight();
      }
    };

    const handleKeyUp = (e) => {
      // Implement if necessary
    };

    const movePaddleLeft = () => {
      setPaddleX((prev) => Math.max(prev - 5, 0)); // Adjust the increment as desired
    };

    const movePaddleRight = () => {
      setPaddleX((prev) => Math.min(prev + 5, 100 - paddleWidth)); // Adjust the increment as desired
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, paused, selectingStartPoint]);

  // Handle right-click to pause/unpause
  const handleRightClick = (e) => {
    e.preventDefault();
    setPaused(!paused);
  };

  // Handle canvas click to set the start point of the ball
  const handleCanvasClick = (e) => {
    if (!selectingStartPoint) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setBallX((clickX / rect.width) * 100);
    setBallY((clickY / rect.height) * 100);
    setSelectingStartPoint(false);
  };

  // Get time elapsed since game start
  const getTimeElapsed = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Render the game interface
  return (
    <div className="pong-game">
      {gameOver ? (
        <div className="game-over">
          <h1>Game Over</h1>
          <button onClick={resetGame}>Play Again!</button>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={window.innerWidth * 0.4}
            height={window.innerHeight}
            onContextMenu={handleRightClick}
            onClick={handleCanvasClick}
            style={{ border: '1px solid black' }}
          >
            {draw(canvasRef, paddleX, ballX, ballY, paddleWidth, paddleHeight, ballSize, selectingStartPoint)}
          </canvas>
          <div className="timer">{getTimeElapsed()}</div>
        </>
      )}
    </div>
  );
};

// Function to draw game elements on the canvas
const draw = (canvasRef, paddleX, ballX, ballY, paddleWidth, paddleHeight, ballSize, selectingStartPoint) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddle
  ctx.fillStyle = 'pink';
  ctx.fillRect(
    (paddleX / 100) * canvas.width,
    canvas.height - (paddleHeight / 100) * canvas.height,
    (paddleWidth / 100) * canvas.width,
    (paddleHeight / 100) * canvas.height
  );

  // Draw ball
  ctx.fillRect(
    (ballX / 100) * canvas.width,
    (ballY / 100) * canvas.height,
    (ballSize / 100) * canvas.width,
    (ballSize / 100) * canvas.height
  );

  // Draw start screen if selecting start point
  if (selectingStartPoint) {
    ctx.fillStyle = 'rgba(255, 20, 147, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Click to set the starting point of the ball', 10, canvas.height / 2);
  }
};

export default Pong;
