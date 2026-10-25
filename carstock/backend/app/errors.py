"""Domain errors raised by the service layer.

Services never import FastAPI. They raise these exceptions, and `main.py` translates them
into HTTP responses. That keeps business rules independent of the web framework.
"""


class DomainError(Exception):
    """Base class; carries the HTTP status the API should answer with."""

    status_code = 400


class NotFoundError(DomainError):
    status_code = 404


class ConflictError(DomainError):
    status_code = 409


class InsufficientStockError(ConflictError):
    """A purchase asked for more units than are in stock."""


class AuthenticationError(DomainError):
    status_code = 401
