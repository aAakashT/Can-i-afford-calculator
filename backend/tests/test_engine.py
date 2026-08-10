from app.domain.affordability.engine import AffordabilityEngine, PurchaseProfile


def profile(**overrides):
    values = dict(monthly_income=100000, essential_expenses=35000, discretionary_expenses=10000, existing_emi=10000, other_debt=0, savings=300000, target_price=1000000, down_payment=200000, interest_rate=9, tenure_months=60, payment_method="part", risk="balanced")
    values.update(overrides)
    return PurchaseProfile(**values)


def test_acceptance_scenario_has_expected_emi_and_a_verdict():
    result = AffordabilityEngine().calculate(profile())
    assert 16_000 < result.monthly_emi < 17_000
    assert result.total_interest > 0
    assert result.verdict in {"comfortable", "affordable", "borderline", "risky", "not-affordable"}
    assert result.maximum_price <= 1_000_000


def test_zero_interest_is_simple_principal_divided_by_tenure():
    assert AffordabilityEngine.calculate_emi(120000, 0, 12) == 10000


def test_cash_purchase_has_no_emi_or_financing_cost():
    result = AffordabilityEngine().calculate(profile(payment_method="cash", target_price=50000, down_payment=0))
    assert result.monthly_emi == 0
    assert result.total_interest == 0


def test_more_income_does_not_reduce_score():
    engine = AffordabilityEngine()
    assert engine.calculate(profile(monthly_income=150000)).score >= engine.calculate(profile()).score


def test_more_expensive_purchase_does_not_improve_score():
    engine = AffordabilityEngine()
    assert engine.calculate(profile(target_price=1500000)).score <= engine.calculate(profile()).score


def test_more_existing_debt_does_not_improve_score():
    engine = AffordabilityEngine()
    assert engine.calculate(profile(existing_emi=30000)).score <= engine.calculate(profile()).score
