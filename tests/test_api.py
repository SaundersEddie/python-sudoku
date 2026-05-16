from app import app
from sudoku_engine import generate_solution


def test_api_rejects_missing_board_data():
    client = app.test_client()

    response = client.post("/api/test-solution", json={})

    assert response.status_code == 400

    data = response.get_json()

    assert data["ok"] is False
    assert data["error"] == "Missing board data."


def test_api_detects_unique_solution_from_completed_board():
    client = app.test_client()
    board = generate_solution()

    response = client.post("/api/test-solution", json={"board": board})

    assert response.status_code == 200

    data = response.get_json()

    assert data["ok"] is True
    assert data["solution_count"] == 1
    assert data["status"] == "unique_solution"
    assert data["message"] == "Unique solution found."


def test_api_detects_no_solution_from_broken_board():
    client = app.test_client()
    board = generate_solution()

    board[0][1] = board[0][0]

    response = client.post("/api/test-solution", json={"board": board})

    assert response.status_code == 200

    data = response.get_json()

    assert data["ok"] is True
    assert data["solution_count"] == 0
    assert data["status"] == "no_solution"
    assert data["message"] == "No solution found."
