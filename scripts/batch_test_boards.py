import argparse
import time

from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from sudoku_engine import (
    count_solutions,
    count_visible_cells,
    create_unique_puzzle,
    generate_solution,
    is_valid_solution,
)


def run_batch_test(total_boards: int, visible_count: int, max_attempts: int) -> None:
    start_time = time.perf_counter()

    successful_boards = 0
    failed_boards = 0

    slowest_board_seconds = 0.0

    for board_number in range(1, total_boards + 1):
        board_start = time.perf_counter()

        try:
            solution = generate_solution()

            if not is_valid_solution(solution):
                failed_boards += 1
                print(f"FAIL board {board_number}: generated solution was invalid")
                continue

            puzzle = create_unique_puzzle(
                solution,
                visible_count=visible_count,
                max_attempts=max_attempts,
            )

            visible_cells = count_visible_cells(puzzle)
            solution_count = count_solutions(puzzle, limit=2)

            if visible_cells != visible_count:
                failed_boards += 1
                print(
                    f"FAIL board {board_number}: expected {visible_count} clues, "
                    f"got {visible_cells}"
                )
                continue

            if solution_count != 1:
                failed_boards += 1
                print(
                    f"FAIL board {board_number}: expected 1 solution, "
                    f"got {solution_count}"
                )
                continue

            successful_boards += 1

        except Exception as error:
            failed_boards += 1
            print(f"FAIL board {board_number}: {error}")

        board_seconds = time.perf_counter() - board_start
        slowest_board_seconds = max(slowest_board_seconds, board_seconds)

    total_seconds = time.perf_counter() - start_time

    print()
    print("Batch Sudoku Test Complete")
    print("--------------------------")
    print(f"Requested boards: {total_boards}")
    print(f"Visible clues: {visible_count}")
    print(f"Max attempts per board: {max_attempts}")
    print(f"Successful boards: {successful_boards}")
    print(f"Failed boards: {failed_boards}")
    print(f"Total time: {total_seconds:.3f}s")
    print(f"Average time per board: {total_seconds / total_boards:.3f}s")
    print(f"Slowest board: {slowest_board_seconds:.3f}s")

    if failed_boards > 0:
        raise SystemExit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate and validate batches of unique Sudoku puzzles."
    )

    parser.add_argument(
        "--boards",
        type=int,
        default=1000,
        help="Number of boards to generate and test.",
    )

    parser.add_argument(
        "--visible",
        type=int,
        default=40,
        help="Number of visible clues per puzzle.",
    )

    parser.add_argument(
        "--max-attempts",
        type=int,
        default=1000,
        help="Maximum attempts to create each unique puzzle.",
    )

    args = parser.parse_args()

    run_batch_test(
        total_boards=args.boards,
        visible_count=args.visible,
        max_attempts=args.max_attempts,
    )


if __name__ == "__main__":
    main()
