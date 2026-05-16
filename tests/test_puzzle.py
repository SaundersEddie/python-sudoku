import pytest

from sudoku_engine import (
    count_visible_cells,
    create_puzzle,
    generate_solution,
    is_valid_solution,
)


def test_create_puzzle_keeps_board_shape():
    solution = generate_solution()
    puzzle = create_puzzle(solution, 10)

    assert len(puzzle) == 9
    assert all(len(row) == 9 for row in puzzle)


def test_create_puzzle_uses_requested_visible_count():
    solution = generate_solution()
    puzzle = create_puzzle(solution, 10)

    assert count_visible_cells(puzzle) == 10


def test_create_puzzle_uses_zero_for_blanks():
    solution = generate_solution()
    puzzle = create_puzzle(solution, 10)

    blank_count = sum(
        1
        for row in puzzle
        for value in row
        if value == 0
    )

    assert blank_count == 71


def test_create_puzzle_does_not_modify_original_solution():
    solution = generate_solution()
    original_solution = [row.copy() for row in solution]

    create_puzzle(solution, 10)

    assert solution == original_solution
    assert is_valid_solution(solution) is True


def test_create_puzzle_rejects_negative_visible_count():
    solution = generate_solution()

    with pytest.raises(ValueError):
        create_puzzle(solution, -1)


def test_create_puzzle_rejects_visible_count_over_81():
    solution = generate_solution()

    with pytest.raises(ValueError):
        create_puzzle(solution, 82)