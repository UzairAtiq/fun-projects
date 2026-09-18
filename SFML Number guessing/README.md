# Number Guessing Game

A simple number guessing game built with C++ and SFML.

## Features
- Guess a random number between 1 and 100
- Visual feedback for your guesses (too high/too low)
- Tracks number of attempts
- Restart functionality

## Prerequisites
- C++ compiler (g++ or clang++)
- SFML library installed

### Installing SFML on macOS
```bash
brew install sfml
```

## Building and Running

### Using Make:
```bash
make
./number_guess
```

### Or compile manually:
```bash
g++ -std=c++11 number_guess.cpp -o number_guess -lsfml-graphics -lsfml-window -lsfml-system
./number_guess
```

## How to Play
1. Type your guess (1-100) using the keyboard
2. Press ENTER to submit your guess
3. Follow the hints (too high/too low) to narrow down the number
4. Press R to restart with a new number anytime

## Controls
- **Number keys**: Enter your guess
- **Backspace**: Delete last digit
- **Enter**: Submit guess
- **R**: Restart game with new number
