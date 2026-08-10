from dataclasses import dataclass
from typing import Literal

Risk = Literal["conservative", "balanced", "aggressive"]
PaymentMethod = Literal["cash", "emi", "part"]


@dataclass(frozen=True)
class RiskSetting:
    max_debt_ratio: float
    emergency_months: int
    buffer_months: float


@dataclass(frozen=True)
class PurchaseProfile:
    monthly_income: float
    essential_expenses: float
    discretionary_expenses: float
    existing_emi: float
    other_debt: float
    savings: float
    target_price: float
    down_payment: float
    interest_rate: float
    tenure_months: int
    payment_method: PaymentMethod
    risk: Risk


@dataclass(frozen=True)
class AffordabilityResult:
    score: int
    verdict: str
    monthly_emi: float
    total_interest: float
    total_repayment: float
    monthly_buffer: float
    post_purchase_savings: float
    emergency_coverage: float
    recommended_emergency_fund: float
    maximum_price: float
    maximum_emi: float
    debt_ratio: float
    savings_rate: float
    purchase_to_income: float
    wait_months: int
    reasons: list[dict[str, object]]


RISK_SETTINGS: dict[Risk, RiskSetting] = {
    "conservative": RiskSetting(max_debt_ratio=0.30, emergency_months=6, buffer_months=1.5),
    "balanced": RiskSetting(max_debt_ratio=0.40, emergency_months=4, buffer_months=1.0),
    "aggressive": RiskSetting(max_debt_ratio=0.50, emergency_months=3, buffer_months=0.6),
}


class AffordabilityEngine:
    """Pure calculation service. No HTTP, database, or framework concerns belong here."""

    @staticmethod
    def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
        if principal <= 0 or tenure_months <= 0:
            return 0.0
        if annual_rate <= 0:
            return principal / tenure_months
        monthly_rate = annual_rate / 100 / 12
        factor = (1 + monthly_rate) ** tenure_months
        return principal * monthly_rate * factor / (factor - 1)

    def calculate(self, profile: PurchaseProfile) -> AffordabilityResult:
        risk = RISK_SETTINGS[profile.risk]
        loan_amount = 0 if profile.payment_method == "cash" else max(
            0, profile.target_price - (profile.down_payment if profile.payment_method == "part" else 0)
        )
        emi = self.calculate_emi(loan_amount, profile.interest_rate, profile.tenure_months)
        total_repayment = emi * (0 if profile.payment_method == "cash" else profile.tenure_months)
        total_interest = max(0, total_repayment - loan_amount)
        cash_outflow = profile.target_price if profile.payment_method == "cash" else (profile.down_payment if profile.payment_method == "part" else 0)
        monthly_buffer = profile.monthly_income - profile.essential_expenses - profile.discretionary_expenses - profile.existing_emi - profile.other_debt - emi
        post_purchase_savings = max(0, profile.savings - cash_outflow)
        recommended_emergency = profile.essential_expenses * risk.emergency_months
        coverage = post_purchase_savings / profile.essential_expenses if profile.essential_expenses else (99 if post_purchase_savings else 0)
        debt_ratio = (profile.existing_emi + profile.other_debt + emi) / profile.monthly_income if profile.monthly_income else (99 if emi else 0)
        savings_rate = max(0, profile.monthly_income - profile.essential_expenses - profile.discretionary_expenses - profile.existing_emi - profile.other_debt) / profile.monthly_income if profile.monthly_income else 0
        purchase_to_income = profile.target_price / (profile.monthly_income * 12) if profile.monthly_income else 99

        score = 100.0
        score -= min(35, debt_ratio * 100 * 0.75)
        score -= min(22, max(0, -monthly_buffer) / max(1, profile.monthly_income) * 100)
        score -= min(22, max(0, recommended_emergency - post_purchase_savings) / max(1, recommended_emergency) * 22)
        score -= min(16, max(0, profile.target_price - max(profile.savings, profile.monthly_income * 6)) / max(1, profile.monthly_income * 12) * 16)
        if monthly_buffer >= profile.essential_expenses * risk.buffer_months:
            score += 4
        if coverage >= risk.emergency_months:
            score += 4
        score = max(0, min(100, round(score)))
        verdict = "comfortable" if score >= 80 else "affordable" if score >= 65 else "borderline" if score >= 50 else "risky" if score >= 30 else "not-affordable"

        maximum_emi = max(0, profile.monthly_income * risk.max_debt_ratio - profile.existing_emi - profile.other_debt)
        cash_price = max(0, profile.savings - recommended_emergency)
        rate = profile.interest_rate / 100 / 12
        financed_principal = maximum_emi * (1 - (1 + rate) ** -profile.tenure_months) / max(0.000001, rate) if rate and profile.tenure_months else maximum_emi * profile.tenure_months
        maximum_price = min(profile.target_price, cash_price if profile.payment_method == "cash" else cash_price + financed_principal)
        monthly_capacity = max(0, profile.monthly_income - profile.essential_expenses - profile.discretionary_expenses - profile.existing_emi - profile.other_debt)
        savings_gap = max(0, profile.target_price - profile.savings + recommended_emergency)
        wait_months = round((savings_gap + monthly_capacity - 1) // monthly_capacity) if monthly_capacity else 0

        reasons: list[dict[str, object]] = []
        if monthly_buffer >= profile.essential_expenses * risk.buffer_months:
            reasons.append({"text": "Your monthly cash flow leaves room after this purchase.", "positive": True})
        else:
            reasons.append({"text": "The new commitment would leave a thin monthly buffer.", "positive": False})
        if coverage >= risk.emergency_months:
            reasons.append({"text": f"{coverage:.1f} months of essential expenses stay covered.", "positive": True})
        else:
            reasons.append({"text": f"Your emergency fund would cover {coverage:.1f} months, below your {risk.emergency_months}-month {profile.risk} target.", "positive": False})
        if debt_ratio <= risk.max_debt_ratio:
            reasons.append({"text": f"Total debt payments are {debt_ratio * 100:.0f}% of monthly income.", "positive": True})
        else:
            reasons.append({"text": f"Debt payments reach {debt_ratio * 100:.0f}% of monthly income.", "positive": False})

        return AffordabilityResult(score, verdict, emi, total_interest, total_repayment, monthly_buffer, post_purchase_savings, coverage, recommended_emergency, max(0, maximum_price), maximum_emi, debt_ratio, savings_rate, purchase_to_income, max(0, wait_months), reasons)
