from typing import Generic, List, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: T


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int

