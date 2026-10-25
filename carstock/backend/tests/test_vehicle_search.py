import pytest


@pytest.fixture
def catalogue(make_vehicle):
    make_vehicle("Toyota", "Camry", "Sedan", 28500, 5)
    make_vehicle("Toyota", "RAV4", "SUV", 33000, 7)
    make_vehicle("Tesla", "Model Y", "Electric", 48000, 0)
    make_vehicle("Honda", "Civic", "Sedan", 24000, 3)


def models(response):
    return sorted(v["model"] for v in response.json())


def test_list_returns_every_vehicle_including_out_of_stock(client, user_headers, catalogue):
    response = client.get("/api/vehicles", headers=user_headers)
    assert response.status_code == 200
    assert models(response) == ["Camry", "Civic", "Model Y", "RAV4"]
    assert any(v["quantity"] == 0 for v in response.json())


def test_list_is_empty_when_there_are_no_vehicles(client, user_headers):
    assert client.get("/api/vehicles", headers=user_headers).json() == []


def test_vehicle_payload_has_all_required_fields(client, user_headers, catalogue):
    vehicle = client.get("/api/vehicles", headers=user_headers).json()[0]
    assert set(vehicle) == {"id", "make", "model", "category", "price", "quantity"}


@pytest.mark.parametrize(
    "query, expected",
    [
        ("make=toy", ["Camry", "RAV4"]),  # partial + case-insensitive
        ("model=civic", ["Civic"]),
        ("category=sedan", ["Camry", "Civic"]),
        ("q=model", ["Model Y"]),  # q matches make OR model
        ("q=honda", ["Civic"]),
        ("min_price=30000", ["Model Y", "RAV4"]),
        ("max_price=25000", ["Civic"]),
        ("min_price=25000&max_price=40000", ["Camry", "RAV4"]),
        ("make=toyota&category=suv&max_price=40000", ["RAV4"]),
        ("make=ferrari", []),
    ],
)
def test_search_filters(client, user_headers, catalogue, query, expected):
    assert models(client.get(f"/api/vehicles/search?{query}", headers=user_headers)) == expected


def test_list_endpoint_accepts_the_same_filters(client, user_headers, catalogue):
    assert models(client.get("/api/vehicles?category=Electric", headers=user_headers)) == ["Model Y"]


def test_search_treats_wildcards_literally(client, user_headers, catalogue):
    assert client.get("/api/vehicles/search?make=%25", headers=user_headers).json() == []
    assert client.get("/api/vehicles/search?make=T_yota", headers=user_headers).json() == []


@pytest.mark.parametrize("query", ["min_price=500&max_price=100", "min_price=-5", "max_price=abc"])
def test_search_rejects_invalid_price_filters(client, user_headers, query):
    assert client.get(f"/api/vehicles/search?{query}", headers=user_headers).status_code == 422
