from abc import ABC, abstractmethod

from app.schemas.affordability import ProductResponse


class ProductProvider(ABC):
    @abstractmethod
    def get_products(self, category: str, max_price: float) -> list[ProductResponse]:
        raise NotImplementedError


class ManualProductProvider(ProductProvider):
    """Empty production-safe provider until curated or affiliate data is configured."""

    def get_products(self, category: str, max_price: float) -> list[ProductResponse]:
        return []
