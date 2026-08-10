from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AffordabilityRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    monthly_income: float = Field(ge=0, le=1_000_000_000)
    essential_expenses: float = Field(ge=0, le=1_000_000_000)
    discretionary_expenses: float = Field(default=0, ge=0, le=1_000_000_000)
    existing_emi: float = Field(default=0, ge=0, le=1_000_000_000)
    other_debt: float = Field(default=0, ge=0, le=1_000_000_000)
    savings: float = Field(default=0, ge=0, le=10_000_000_000)
    target_price: float = Field(ge=0, le=10_000_000_000)
    down_payment: float = Field(default=0, ge=0, le=10_000_000_000)
    interest_rate: float = Field(default=0, ge=0, le=100)
    tenure_months: int = Field(default=0, ge=0, le=480)
    payment_method: Literal["cash", "emi", "part"] = "cash"
    risk: Literal["conservative", "balanced", "aggressive"] = "balanced"

    @field_validator("target_price")
    @classmethod
    def price_must_be_present(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Target price must be greater than zero.")
        return value

    @model_validator(mode="after")
    def tenure_required_for_finance(self):
        if self.payment_method != "cash" and self.tenure_months <= 0:
            raise ValueError("Loan tenure must be greater than zero for EMI purchases.")
        return self


class CalculationResponse(BaseModel):
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


class ProductResponse(BaseModel):
    name: str
    category: str
    price: float
    image_url: str | None = None
    product_url: str | None = None
    brand: str | None = None
    last_updated: str | None = None
    is_demo: bool = False
