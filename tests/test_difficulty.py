from sudoku_engine import (
    DIFFICULTY_CLUES,
    get_normalized_difficulty,
    get_visible_count_for_difficulty,
)


def test_easy_difficulty_uses_40_clues():
    assert get_visible_count_for_difficulty("easy") == 40


def test_medium_difficulty_uses_35_clues():
    assert get_visible_count_for_difficulty("medium") == 35


def test_hard_difficulty_uses_32_clues():
    assert get_visible_count_for_difficulty("hard") == 32


def test_difficulty_lookup_is_case_insensitive():
    assert get_visible_count_for_difficulty("HARD") == 32


def test_invalid_difficulty_defaults_to_easy_clue_count():
    assert get_visible_count_for_difficulty("banana") == 40


def test_invalid_difficulty_normalizes_to_easy():
    assert get_normalized_difficulty("banana") == "easy"


def test_supported_difficulty_normalizes_to_lowercase():
    assert get_normalized_difficulty("MeDiUm") == "medium"


def test_difficulty_config_contains_expected_values():
    assert DIFFICULTY_CLUES == {
        "easy": 40,
        "medium": 35,
        "hard": 32,
    }
