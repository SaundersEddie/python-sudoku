# Python Sudoku

A Python web Sudoku project built step by step.

This repo is being developed as a reference implementation for Sudoku board generation, validation, solution testing, and future gameplay features. The Python version is being used to prove the logic before later JavaScript and Unity versions are built.

The JavaScript version may eventually be adapted for EddiesGames.xyz, so the core rules and testing approach are being developed carefully here first.

## Current Status

The project currently generates real Sudoku puzzle boards with unique solutions.

Current state:

- Flask web app renders a Sudoku puzzle board
- Solved Sudoku boards are generated in Python
- Puzzle boards are created by removing values from solved boards
- Blank cells are represented internally as `0`
- Puzzle boards can be generated with a requested number of visible clues
- The app can reveal the solution using a dev `Show Solution` button
- The app can test the current puzzle using a `Test Solution` button
- The solver can detect no solution, one solution, or multiple solutions
- Unique-solution puzzle generation is working
- Automated pytest coverage is in place
- Batch generation testing is available through a script

The current web app uses unique-solution puzzle generation rather than loose random clue removal.

## Current Benchmarks

Batch testing has been run successfully with:

- 1000 boards at 40 visible clues
- 1000 boards at 32 visible clues

Observed result for 40 visible clues:

- 1000 requested boards
- 1000 successful boards
- 0 failed boards
- About 12.4 seconds total
- About 0.012 seconds average per board
- About 0.101 seconds slowest board

Observed result for 32 visible clues:

- 1000 requested boards
- 1000 successful boards
- 0 failed boards

Current practical clue-count targets:

- Easy: 40 visible clues
- Medium: 35 visible clues
- Hard: 32 visible clues

The current generator has shown that 31 visible clues is unreliable with the current random-removal approach, so 32 is being treated as the practical lower bound for now.

## Current Features

- Flask web app
- Random solved Sudoku board generation
- Completed board validation
- Incomplete puzzle validation
- Puzzle board creation from solved boards
- Visible clue counting
- Solver-based solution counting
- Unique-solution puzzle generation
- Browser-rendered 9x9 Sudoku grid
- 3x3 box borders
- Dev solution reveal
- Dev solution test button
- Pytest test suite
- API tests
- Batch board generation script

## End Goal

The finished Python version should include:

- Easy, Medium, and Hard difficulty levels
- Timer
- Move count
- Notes / pencil marks
- Pause mode
- Light and dark modes
- Subtle row, column, box, and matching-number highlights
- Player input
- Puzzle completion detection
- Solution validation
- Automated board generation testing
- Clean game rules that can later be reused in JavaScript and Unity versions

## Development Plan

The project is being built in small controlled steps.

Completed steps:

1. Generate a valid solved Sudoku board
2. Render the solved board in the browser
3. Validate generated solved boards
4. Add pytest validation tests
5. Add negative tests for bad boards
6. Remove numbers to create puzzle boards
7. Render blank puzzle cells
8. Add solution reveal
9. Add a solver to count solutions
10. Add API solution testing
11. Add unique-solution puzzle generation
12. Add batch puzzle generation testing

Upcoming steps:

1. Add difficulty selection
2. Add player cell selection
3. Add number entry
4. Add notes / pencil marks
5. Add timer and move count
6. Add pause mode
7. Add subtle row, column, box, and matching-number highlights
8. Add light and dark modes
9. Add completion modal
10. Add final polish

## Project Structure

    python-sudoku/
      app.py
      sudoku_engine.py
      requirements.txt
      pytest.ini
      scripts/
        batch_test_boards.py
      tests/
        test_api.py
        test_puzzle.py
        test_solver.py
        test_unique_puzzle.py
        test_validator.py
      templates/
        index.html
      static/
        style.css
        sudoku-dev.js

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

## Run Tests

    pytest -v

Current expected result:

    28 passed

## Test Coverage

The current pytest suite covers the following areas.

### Validator Tests

File:

    tests/test_validator.py

Covered behavior:

- Valid generated boards are accepted
- Row duplicates are rejected
- Column duplicates are rejected
- 3x3 box duplicates are rejected
- Wrong board sizes are rejected
- Wrong row sizes are rejected
- Invalid value `0` is rejected in completed solutions
- Invalid value `10` is rejected in completed solutions

### Puzzle Creation Tests

File:

    tests/test_puzzle.py

Covered behavior:

- Puzzle boards keep the correct 9x9 shape
- Puzzle boards use the requested visible clue count
- Blank cells are represented with `0`
- Puzzle creation does not modify the original solved board
- Negative visible counts are rejected
- Visible counts over 81 are rejected

### Solver Tests

File:

    tests/test_solver.py

Covered behavior:

- A completed valid board has one solution
- A generated puzzle has at least one solution
- A deliberately broken puzzle has no solution
- An empty board has multiple solutions
- Invalid solution-count limits are rejected

### API Tests

File:

    tests/test_api.py

Covered behavior:

- `/api/test-solution` rejects missing board data
- `/api/test-solution` detects a unique solution from a completed valid board
- `/api/test-solution` detects no solution from a broken board

### Unique Puzzle Tests

File:

    tests/test_unique_puzzle.py

Covered behavior:

- Unique puzzle generation returns the requested visible clue count
- Unique puzzle generation returns a board with one solution
- Unique puzzle generation does not modify the original solved board
- Negative visible counts are rejected
- Visible counts over 81 are rejected
- Invalid max-attempt values are rejected

## Batch Testing

Batch testing is handled by:

    scripts/batch_test_boards.py

Run the default batch test:

    python scripts/batch_test_boards.py

Run a custom batch test:

    python scripts/batch_test_boards.py --boards 1000 --visible 40 --max-attempts 1000

Example useful runs:

    python scripts/batch_test_boards.py --boards 1000 --visible 40 --max-attempts 1000
    python scripts/batch_test_boards.py --boards 1000 --visible 35 --max-attempts 1000
    python scripts/batch_test_boards.py --boards 1000 --visible 32 --max-attempts 1000

The batch script checks that:

- Each generated solution is valid
- Each puzzle has the requested visible clue count
- Each puzzle has exactly one solution
- Failures are reported
- Total time, average time, and slowest board time are reported

## Current Validation Rules

A completed Sudoku board is valid when:

- The board has exactly 9 rows
- Each row has exactly 9 values
- Each row contains numbers 1 through 9 exactly once
- Each column contains numbers 1 through 9 exactly once
- Each 3x3 box contains numbers 1 through 9 exactly once

An incomplete puzzle board is valid when:

- The board has exactly 9 rows
- Each row has exactly 9 values
- Blank cells are represented by `0`
- Non-blank values are between 1 and 9
- No row has duplicate non-zero values
- No column has duplicate non-zero values
- No 3x3 box has duplicate non-zero values

## Solution Counting

The solver counts solutions up to a limit.

For uniqueness checking, the limit is `2`.

Result meanings:

- `0` means no solution
- `1` means exactly one solution
- `2` means multiple solutions

The solver stops once it reaches the limit, because the project only needs to know whether a puzzle is unique or not.

## Notes

This project is intentionally being built in small steps.

The focus is:

- correctness first
- stable tests
- clean generation logic
- portable rules for future JavaScript and Unity versions
- no giant all-at-once code dump

The current Python version is now a working reference for Sudoku generation and uniqueness testing.
