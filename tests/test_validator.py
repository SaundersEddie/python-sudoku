from copy import deepcopy

from sudoku_engine import generate_solution, is_valid_solution


def make_valid_board() -> list[list[int]]:
    board = generate_solution()

    assert is_valid_solution(board) is True

    return board


def test_valid_generated_board_is_accepted():
    board = make_valid_board()

    assert is_valid_solution(board) is True


def test_row_duplicate_is_rejected():
    board = make_valid_board()

    board[0][1] = board[0][0]

    assert is_valid_solution(board) is False


def test_column_duplicate_is_rejected():
    board = make_valid_board()

    board[1][0] = board[0][0]

    assert is_valid_solution(board) is False


def test_box_duplicate_is_rejected():
    board = make_valid_board()

    board[1][1] = board[0][0]

    assert is_valid_solution(board) is False


def test_wrong_board_size_is_rejected():
    board = make_valid_board()

    smaller_board = board[:-1]

    assert is_valid_solution(smaller_board) is False


def test_wrong_row_size_is_rejected():
    board = make_valid_board()

    bad_board = deepcopy(board)
    bad_board[0] = bad_board[0][:-1]

    assert is_valid_solution(bad_board) is False


def test_zero_value_is_rejected():
    board = make_valid_board()

    board[0][0] = 0

    assert is_valid_solution(board) is False


def test_ten_value_is_rejected():
    board = make_valid_board()

    board[0][0] = 10

    assert is_valid_solution(board) is False