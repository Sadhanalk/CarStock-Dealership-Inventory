"""Pydantic request/response models (input validation lives here)."""
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


def _clean_text(value: str | None) -> str | None:
    """Trim whitespace and reject values that are blank after trimming."""
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        raise ValueError("must not be blank")
    return cleaned


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_needs_letter_and_digit(cls, value: str) -> str:
        if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
            raise ValueError("must contain at least one letter and one number")
        return value

    @field_validator("full_name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        return _clean_text(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_admin: bool
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class VehicleBase(BaseModel):
    make: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=80)
    category: str = Field(min_length=1, max_length=80)
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)

    @field_validator("make", "model", "category")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return _clean_text(value)


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    """Partial update: every field is optional, but at least one must be supplied."""

    make: str | None = Field(default=None, min_length=1, max_length=80)
    model: str | None = Field(default=None, min_length=1, max_length=80)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    price: float | None = Field(default=None, gt=0)
    quantity: int | None = Field(default=None, ge=0)

    @field_validator("make", "model", "category")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return _clean_text(value)

    @model_validator(mode="after")
    def at_least_one_field(self) -> "VehicleUpdate":
        if not self.model_fields_set:
            raise ValueError("provide at least one field to update")
        return self


class PurchaseRequest(BaseModel):
    quantity: int = Field(default=1, gt=0)


class RestockRequest(BaseModel):
    quantity: int = Field(gt=0)


class VehiclePublic(VehicleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
