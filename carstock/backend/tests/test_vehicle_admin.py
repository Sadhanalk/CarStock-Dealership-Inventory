import pytest

NEW_CAR = {"make": "Nori", "model": "City E", "category": "Compact", "price": 28900, "quantity": 2}


class TestCreate:
    def test_admin_can_create_a_vehicle(self, client, admin_headers):
        response = client.post("/api/vehicles", headers=admin_headers, json=NEW_CAR)
        assert response.status_code == 201
        assert response.json() == {"id": response.json()["id"], **NEW_CAR}

    def test_vehicle_is_persisted_and_visible_in_the_list(self, client, admin_headers, user_headers):
        client.post("/api/vehicles", headers=admin_headers, json=NEW_CAR)
        assert [v["model"] for v in client.get("/api/vehicles", headers=user_headers).json()] == ["City E"]

    def test_text_fields_are_trimmed(self, client, admin_headers):
        response = client.post("/api/vehicles", headers=admin_headers, json={**NEW_CAR, "make": "  Nori  "})
        assert response.json()["make"] == "Nori"

    def test_normal_user_is_forbidden(self, client, user_headers):
        assert client.post("/api/vehicles", headers=user_headers, json=NEW_CAR).status_code == 403

    @pytest.mark.parametrize(
        "override",
        [
            {"make": ""},
            {"model": "   "},
            {"category": ""},
            {"price": 0},
            {"price": -10},
            {"quantity": -1},
            {"quantity": 1.5},
            {"price": "free"},
        ],
    )
    def test_invalid_payloads_are_rejected(self, client, admin_headers, override):
        assert client.post("/api/vehicles", headers=admin_headers, json={**NEW_CAR, **override}).status_code == 422

    def test_missing_fields_are_rejected(self, client, admin_headers):
        assert client.post("/api/vehicles", headers=admin_headers, json={"make": "Only make"}).status_code == 422


class TestUpdate:
    def test_admin_can_partially_update(self, client, admin_headers, make_vehicle):
        vehicle = make_vehicle()
        response = client.put(f"/api/vehicles/{vehicle.id}", headers=admin_headers, json={"price": 29900, "quantity": 9})
        assert response.status_code == 200
        assert response.json()["price"] == 29900 and response.json()["quantity"] == 9
        assert response.json()["make"] == "Lumen"  # untouched fields stay as they were

    def test_unknown_vehicle_is_404(self, client, admin_headers):
        assert client.put("/api/vehicles/9999", headers=admin_headers, json={"price": 1}).status_code == 404

    def test_normal_user_is_forbidden(self, client, user_headers, make_vehicle):
        assert client.put(f"/api/vehicles/{make_vehicle().id}", headers=user_headers, json={"price": 1}).status_code == 403

    @pytest.mark.parametrize("body", [{}, {"price": -1}, {"quantity": -5}, {"make": "  "}])
    def test_invalid_updates_are_rejected(self, client, admin_headers, make_vehicle, body):
        assert client.put(f"/api/vehicles/{make_vehicle().id}", headers=admin_headers, json=body).status_code == 422


class TestDelete:
    def test_admin_can_delete_then_gets_404(self, client, admin_headers, make_vehicle):
        vehicle = make_vehicle()
        assert client.delete(f"/api/vehicles/{vehicle.id}", headers=admin_headers).status_code == 204
        assert client.delete(f"/api/vehicles/{vehicle.id}", headers=admin_headers).status_code == 404

    def test_normal_user_is_forbidden_and_vehicle_survives(self, client, user_headers, make_vehicle):
        vehicle = make_vehicle()
        assert client.delete(f"/api/vehicles/{vehicle.id}", headers=user_headers).status_code == 403
        assert len(client.get("/api/vehicles", headers=user_headers).json()) == 1
