from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def payload():
    return {"monthly_income": 100000, "essential_expenses": 35000, "discretionary_expenses": 10000, "existing_emi": 10000, "savings": 300000, "target_price": 1000000, "down_payment": 200000, "interest_rate": 9, "tenure_months": 60, "payment_method": "part", "risk": "balanced"}


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_calculate_returns_structured_result():
    response = client.post("/api/v1/affordability/calculate", json=payload())
    assert response.status_code == 200
    assert {"score", "verdict", "monthly_emi", "maximum_price"}.issubset(response.json())


def test_invalid_values_return_validation_error():
    data = payload()
    data["interest_rate"] = -2
    assert client.post("/api/v1/affordability/calculate", json=data).status_code == 422
