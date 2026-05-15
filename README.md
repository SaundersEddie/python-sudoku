# Python Sudoku

A Python web Sudoku project built step by step.

The goal is to build a working Sudoku game in Python first, then later reuse the same ideas for JavaScript and Unity versions. The JavaScript version may eventually be used on EddiesGames.xyz, so the game rules and validation logic are being developed carefully from the start.

## Current Status

The project currently:

- Generates a completed Sudoku board
- Displays the board in a Flask web app
- Validates generated boards
- Includes automated pytest tests
- Includes negative tests for bad boards

The app does not create playable puzzle boards yet. Right now, it only renders a full solved board.

## Current Features

- Flask web app
- Random solved Sudoku board generation
- 9x9 browser-rendered Sudoku grid
- 3x3 box borders
- Board validation logic
- Pytest test suite
- Pytest config for clean test discovery

## End Goal

The finished Python version should include:

- Easy, Medium, and Hard puzzles
- Timer
- Move count
- Notes / pencil marks
- Pause mode
- Light and dark modes
- Subtle row, column, box, and matching-number highlights
- Puzzle validation
- Solver checks for no solution, one solution, or multiple solutions
- Automated board generation tests

## Development Plan

The project is being built in small steps:

1. Generate a valid solved Sudoku board
2. Validate generated boards
3. Add automated positive and negative tests
4. Remove numbers to create puzzle boards
5. Add a Show Solution dev option
6. Add solution testing
7. Add a solver to check for unique solutions
8. Add player input
9. Add timer, move count, notes, pause, and themes
10. Polish the game for portfolio/demo use

## Project Structure

    python-sudoku/
      app.py
      sudoku_engine.py
      requirements.txt
      pytest.ini
      tests/
        test_validator.py
      templates/
        index.html
      static/
        style.css

## Setup

Create a virtual environment:

    python -m venv .venv

Activate it on Windows PowerShell:

    .venv\Scripts\Activate.ps1

Activate it on Mac/Linux:

    source .venv/bin/activate

Install dependencies:

    pip install -r requirements.txt

## Run the App

    python app.py

Open this in your browser:

    http://127.0.0.1:5000

Refresh the page to generate a new solved board.

## Run Tests

    pytest -v

Current expected result:

    8 passed

## Current Validation Rules

A solved board is valid when:

- The board has exactly 9 rows
- Each row has exactly 9 values
- Each row contains numbers 1 through 9 exactly once
- Each column contains numbers 1 through 9 exactly once
- Each 3x3 box contains numbers 1 through 9 exactly once

The test suite currently checks that valid boards pass and bad boards fail.

Bad board tests include:

- Duplicate number in a row
- Duplicate number in a column
- Duplicate number in a 3x3 box
- Wrong board size
- Wrong row size
- Invalid value of 0
- Invalid value of 10

## Next Step

The next step is to remove numbers from the solved board to create a puzzle board.

Planned behavior:

- Generate a solved board
- Remove values until only a chosen number of clues remain
- Display blank cells in the browser
- Keep the solution available internally for development testing

After that, the project will add solver checks to confirm whether generated puzzles have one solution or multiple solutions.
