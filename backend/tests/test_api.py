"""API endpoint tests."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["mode"] == "mock"


def test_analyze_no_file():
    r = client.post("/api/analyze")
    assert r.status_code == 422  # Missing file


def test_analyze_wrong_type():
    r = client.post(
        "/api/analyze",
        files={"file": ("test.txt", b"hello world", "text/plain")},
    )
    assert r.status_code == 400
