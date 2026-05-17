from copy import deepcopy

from sudoku_engine import generate_solution, is_valid_solution


def print_result(test_name: str, passed: bool) -> None:
    status = "PASS" if passed else "FAIL"
    print(f"{status}: {test_name}")


def make_valid_board() -> list[list[int]]:
    board = generate_solution()

    if not is_valid_solution(board):
        raise RuntimeError("Generated board failed validation before tests started.")

    return board


def test_valid_generated_board() -> bool:
    board = make_valid_board()
    return is_valid_solution(board) is True


def test_row_duplicate_rejected() -> bool:
    board = make_valid_board()

    # Force row 0 to contain a duplicate value.
    board[0][1] = board[0][0]

    return is_valid_solution(board) is False


def test_column_duplicate_rejected() -> bool:
    board = make_valid_board()

    # Force column 0 to contain a duplicate value.
    board[1][0] = board[0][0]

    return is_valid_solution(board) is False


def test_box_duplicate_rejected() -> bool:
    board = make_valid_board()

    # Force top-left 3x3 box to contain a duplicate value.
    board[1][1] = board[0][0]

    return is_valid_solution(board) is False


def test_wrong_board_size_rejected() -> bool:
    board = make_valid_board()

    # Remove one row, leaving only 8 rows.
    smaller_board = board[:-1]

    return is_valid_solution(smaller_board) is False


def test_wrong_row_size_rejected() -> bool:
    board = make_valid_board()

    # Remove one value from a row, leaving one row with only 8 values.
    bad_board = deepcopy(board)
    bad_board[0] = bad_board[0][:-1]

    return is_valid_solution(bad_board) is False


def test_zero_value_rejected() -> bool:
    board = make_valid_board()

    board[0][0] = 0

    return is_valid_solution(board) is False


def test_ten_value_rejected() -> bool:
    board = make_valid_board()

    board[0][0] = 10

    return is_valid_solution(board) is False


def run_tests() -> None:
    tests = [
        ("valid generated board accepted", test_valid_generated_board),
        ("row duplicate rejected", test_row_duplicate_rejected),
        ("column duplicate rejected", test_column_duplicate_rejected),
        ("box duplicate rejected", test_box_duplicate_rejected),
        ("wrong board size rejected", test_wrong_board_size_rejected),
        ("wrong row size rejected", test_wrong_row_size_rejected),
        ("zero value rejected", test_zero_value_rejected),
        ("ten value rejected", test_ten_value_rejected),
    ]

    failed_count = 0

    for test_name, test_func in tests:
        passed = test_func()
        print_result(test_name, passed)

        if not passed:
            failed_count += 1

    print()
    print(f"Tests run: {len(tests)}")
    print(f"Failures: {failed_count}")

    if failed_count > 0:
        raise SystemExit(1)


if __name__ == "__main__":
    run_tests()
