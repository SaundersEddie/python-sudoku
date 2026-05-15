import random


GRID_SIZE = 9
BOX_SIZE = 3
EXPECTED_VALUES = set(range(1, GRID_SIZE + 1))


def pattern(row: int, col: int) -> int:
    """
    Creates a valid Sudoku pattern index for a completed board.
    """
    return (BOX_SIZE * (row % BOX_SIZE) + row // BOX_SIZE + col) % GRID_SIZE


def shuffled(items: range | list[int]) -> list[int]:
    """
    Return a shuffled copy of a list/range.
    """
    values = list(items)
    random.shuffle(values)
    return values


def generate_solution() -> list[list[int]]:
    """
    Generate a complete valid 9x9 Sudoku solution board.
    """
    rows = [
        group * BOX_SIZE + row
        for group in shuffled(range(BOX_SIZE))
        for row in shuffled(range(BOX_SIZE))
    ]

    cols = [
        group * BOX_SIZE + col
        for group in shuffled(range(BOX_SIZE))
        for col in shuffled(range(BOX_SIZE))
    ]

    nums = shuffled(range(1, GRID_SIZE + 1))

    board = [
        [nums[pattern(row, col)] for col in cols]
        for row in rows
    ]

    return board


def is_valid_group(values: list[int]) -> bool:
    """
    A row, column, or box is valid when it contains 1-9 exactly once.
    """
    return set(values) == EXPECTED_VALUES


def get_column(board: list[list[int]], col_index: int) -> list[int]:
    """
    Return one column from the board.
    """
    return [row[col_index] for row in board]


def get_box(board: list[list[int]], start_row: int, start_col: int) -> list[int]:
    """
    Return one 3x3 box from the board.
    """
    values = []

    for row in range(start_row, start_row + BOX_SIZE):
        for col in range(start_col, start_col + BOX_SIZE):
            values.append(board[row][col])

    return values


def is_valid_solution(board: list[list[int]]) -> bool:
    """
    Validate that a completed Sudoku board obeys Sudoku rules.
    """
    if len(board) != GRID_SIZE:
        return False

    for row in board:
        if len(row) != GRID_SIZE:
            return False

    for row in board:
        if not is_valid_group(row):
            return False

    for col_index in range(GRID_SIZE):
        if not is_valid_group(get_column(board, col_index)):
            return False

    for start_row in range(0, GRID_SIZE, BOX_SIZE):
        for start_col in range(0, GRID_SIZE, BOX_SIZE):
            if not is_valid_group(get_box(board, start_row, start_col)):
                return False

    return True
