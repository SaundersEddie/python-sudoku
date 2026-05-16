from sudoku_engine import (
    count_solutions,
    create_puzzle,
    generate_solution,
    is_valid_solution,
)


def test_completed_valid_board_has_one_solution():
    solution = generate_solution()

    assert is_valid_solution(solution) is True
    assert count_solutions(solution) == 1


def test_generated_puzzle_has_at_least_one_solution():
    solution = generate_solution()
    puzzle = create_puzzle(solution, 40)

    solution_count = count_solutions(puzzle)

    assert solution_count >= 1


def test_broken_puzzle_has_no_solution():
    board = generate_solution()

    board[0][1] = board[0][0]

    assert count_solutions(board) == 0


def test_empty_board_has_multiple_solutions():
    empty_board = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]

    assert count_solutions(empty_board) == 2


def test_invalid_solution_limit_is_rejected():
    solution = generate_solution()

    try:
        count_solutions(solution, limit=0)
        assert False
    except ValueError:
        assert True
