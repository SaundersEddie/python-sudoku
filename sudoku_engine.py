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

def create_puzzle(solution: list[list[int]], visible_count: int) -> list[list[int]]:
    """
    Create a puzzle board from a completed solution board.

    visible_count controls how many numbers remain visible.
    Blank cells are represented by 0.
    """
    if visible_count < 0 or visible_count > GRID_SIZE * GRID_SIZE:
        raise ValueError("visible_count must be between 0 and 81.")

    puzzle = [row.copy() for row in solution]

    all_positions = [
        (row, col)
        for row in range(GRID_SIZE)
        for col in range(GRID_SIZE)
    ]

    positions_to_remove = shuffled(all_positions)[: GRID_SIZE * GRID_SIZE - visible_count]

    for row, col in positions_to_remove:
        puzzle[row][col] = 0

    return puzzle


def count_visible_cells(board: list[list[int]]) -> int:
    """
    Count how many cells are not blank.
    """
    return sum(
        1
        for row in board
        for value in row
        if value != 0
    )

def is_valid_puzzle(board: list[list[int]]) -> bool:
    """
    Validate an incomplete Sudoku puzzle.

    0 is allowed as a blank.
    Values 1-9 cannot duplicate within any row, column, or 3x3 box.
    """
    if len(board) != GRID_SIZE:
        return False

    for row in board:
        if len(row) != GRID_SIZE:
            return False

        for value in row:
            if value < 0 or value > GRID_SIZE:
                return False

    for row in board:
        values = [value for value in row if value != 0]
        if len(values) != len(set(values)):
            return False

    for col_index in range(GRID_SIZE):
        column = get_column(board, col_index)
        values = [value for value in column if value != 0]
        if len(values) != len(set(values)):
            return False

    for start_row in range(0, GRID_SIZE, BOX_SIZE):
        for start_col in range(0, GRID_SIZE, BOX_SIZE):
            box = get_box(board, start_row, start_col)
            values = [value for value in box if value != 0]
            if len(values) != len(set(values)):
                return False

    return True


def get_candidates(board: list[list[int]], row_index: int, col_index: int) -> list[int]:
    """
    Return the valid candidate numbers for one empty cell.
    """
    if board[row_index][col_index] != 0:
        return []

    used_values = set()

    used_values.update(board[row_index])
    used_values.update(get_column(board, col_index))

    box_start_row = (row_index // BOX_SIZE) * BOX_SIZE
    box_start_col = (col_index // BOX_SIZE) * BOX_SIZE
    used_values.update(get_box(board, box_start_row, box_start_col))

    return [
        number
        for number in range(1, GRID_SIZE + 1)
        if number not in used_values
    ]


def find_best_empty_cell(board: list[list[int]]) -> tuple[int, int] | None:
    """
    Find the empty cell with the fewest possible candidates.

    This keeps the solver much faster than simply scanning left to right.
    """
    best_cell = None
    fewest_candidates = GRID_SIZE + 1

    for row_index in range(GRID_SIZE):
        for col_index in range(GRID_SIZE):
            if board[row_index][col_index] == 0:
                candidate_count = len(get_candidates(board, row_index, col_index))

                if candidate_count < fewest_candidates:
                    fewest_candidates = candidate_count
                    best_cell = (row_index, col_index)

                if candidate_count == 0:
                    return best_cell

    return best_cell


def count_solutions(board: list[list[int]], limit: int = 2) -> int:
    """
    Count possible solutions for a Sudoku puzzle.

    Stops once limit is reached.
    For uniqueness checking, limit=2 is enough:
    0 = no solution
    1 = unique solution
    2 = multiple solutions
    """
    if limit < 1:
        raise ValueError("limit must be at least 1.")

    if not is_valid_puzzle(board):
        return 0

    working_board = [row.copy() for row in board]
    solution_count = 0

    def solve() -> None:
        nonlocal solution_count

        if solution_count >= limit:
            return

        empty_cell = find_best_empty_cell(working_board)

        if empty_cell is None:
            solution_count += 1
            return

        row_index, col_index = empty_cell
        candidates = get_candidates(working_board, row_index, col_index)

        for candidate in candidates:
            working_board[row_index][col_index] = candidate
            solve()
            working_board[row_index][col_index] = 0

            if solution_count >= limit:
                return

    solve()

    return solution_count
