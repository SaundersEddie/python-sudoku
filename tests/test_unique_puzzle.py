import pytest

from sudoku_engine import (
    count_solutions,
    count_visible_cells,
    create_unique_puzzle,
    generate_solution,
    is_valid_solution,
)


def test_create_unique_puzzle_returns_requested_visible_count():
    solution = generate_solution()

    puzzle = create_unique_puzzle(solution, visible_count=40, max_attempts=100)

    assert count_visible_cells(puzzle) == 40


def test_create_unique_puzzle_has_one_solution():
    solution = generate_solution()

    puzzle = create_unique_puzzle(solution, visible_count=40, max_attempts=100)

    assert count_solutions(puzzle, limit=2) == 1


def test_create_unique_puzzle_does_not_modify_original_solution():
    solution = generate_solution()
    original_solution = [row.copy() for row in solution]

    create_unique_puzzle(solution, visible_count=40, max_attempts=100)

    assert solution == original_solution
    assert is_valid_solution(solution) is True


def test_create_unique_puzzle_rejects_negative_visible_count():
    solution = generate_solution()

    with pytest.raises(ValueError):
        create_unique_puzzle(solution, visible_count=-1)


def test_create_unique_puzzle_rejects_visible_count_over_81():
    solution = generate_solution()

    with pytest.raises(ValueError):
        create_unique_puzzle(solution, visible_count=82)


def test_create_unique_puzzle_rejects_invalid_max_attempts():
    solution = generate_solution()

    with pytest.raises(ValueError):
        create_unique_puzzle(solution, visible_count=40, max_attempts=0)
