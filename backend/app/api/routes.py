from dataclasses import asdict

from fastapi import APIRouter, Request

from app.domain.affordability import AffordabilityEngine
from app.domain.affordability.engine import PurchaseProfile
from app.schemas.affordability import AffordabilityRequest, CalculationResponse, ProductResponse
from app.services.product_provider import ManualProductProvider

router = APIRouter(prefix="/api/v1")
engine = AffordabilityEngine()
products = ManualProductProvider()


def to_profile(request: AffordabilityRequest) -> PurchaseProfile:
    return PurchaseProfile(**request.model_dump())


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/affordability/calculate", response_model=CalculationResponse)
def calculate(request: AffordabilityRequest) -> CalculationResponse:
    return CalculationResponse(**asdict(engine.calculate(to_profile(request))))


@router.post("/affordability/max-price", response_model=CalculationResponse)
def max_price(request: AffordabilityRequest) -> CalculationResponse:
    return CalculationResponse(**asdict(engine.calculate(to_profile(request))))


@router.post("/affordability/scenarios", response_model=list[CalculationResponse])
def scenarios(requests: list[AffordabilityRequest]) -> list[CalculationResponse]:
    return [CalculationResponse(**asdict(engine.calculate(to_profile(request)))) for request in requests[:3]]


@router.get("/products", response_model=list[ProductResponse])
def get_products(category: str, max_price: float, request: Request) -> list[ProductResponse]:
    return products.get_products(category, max_price)


@router.get("/categories")
def get_categories() -> list[dict[str, str]]:
    return [{"slug": "car", "name": "Car"}, {"slug": "home", "name": "Home"}, {"slug": "phone", "name": "Phone"}, {"slug": "laptop", "name": "Laptop"}, {"slug": "vacation", "name": "Vacation"}, {"slug": "student-loan", "name": "Education"}]
