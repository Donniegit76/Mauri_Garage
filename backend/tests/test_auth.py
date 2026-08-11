from app import config


def test_no_password_set_allows_open_access(client):
    response = client.get("/api/auth/status")
    assert response.json() == {"auth_required": False}
    assert client.get("/api/items").status_code == 200


def test_password_protected_flow(client, monkeypatch):
    monkeypatch.setattr(config, "APP_PASSWORD", "segreta123")

    assert client.get("/api/auth/status").json() == {"auth_required": True}
    assert client.get("/api/items").status_code == 401

    bad_login = client.post("/api/auth/login", json={"password": "wrong"})
    assert bad_login.status_code == 401

    good_login = client.post("/api/auth/login", json={"password": "segreta123"})
    assert good_login.status_code == 200
    token = good_login.json()["token"]

    authed = client.get("/api/items", headers={"Authorization": f"Bearer {token}"})
    assert authed.status_code == 200
