def _make_ricambio(client, **overrides):
    payload = {
        "sezione": "ricambio",
        "codice": "ABC-123",
        "descrizione": "Faro anteriore sinistro Golf GTI Mk1",
        "categoria": "Golf GTI Mk1",
        "scaffale": "A1",
        "scatola": "3",
        "quantita": 2,
        "note": "Leggero graffio",
    }
    payload.update(overrides)
    return client.post("/api/items", json=payload)


def test_create_and_get_item(client):
    response = _make_ricambio(client)
    assert response.status_code == 201
    data = response.json()
    assert data["codice"] == "ABC-123"
    assert data["sezione"] == "ricambio"

    item_id = data["id"]
    get_response = client.get(f"/api/items/{item_id}")
    assert get_response.status_code == 200
    assert get_response.json()["descrizione"].startswith("Faro anteriore")


def test_update_item(client):
    item_id = _make_ricambio(client).json()["id"]
    response = client.put(f"/api/items/{item_id}", json={"quantita": 5, "note": "Aggiornato"})
    assert response.status_code == 200
    data = response.json()
    assert data["quantita"] == 5
    assert data["note"] == "Aggiornato"
    assert data["codice"] == "ABC-123"


def test_delete_item(client):
    item_id = _make_ricambio(client).json()["id"]
    assert client.delete(f"/api/items/{item_id}").status_code == 204
    assert client.get(f"/api/items/{item_id}").status_code == 404


def test_search_case_insensitive_partial(client):
    _make_ricambio(client, codice="FAR-001", descrizione="Faro Anteriore Destro")
    _make_ricambio(client, codice="SPE-002", descrizione="Specchietto retrovisore")

    response = client.get("/api/items", params={"search": "faro"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["codice"] == "FAR-001"

    response_codice = client.get("/api/items", params={"search": "spe-002"})
    assert response_codice.json()["total"] == 1


def test_filter_by_sezione(client):
    _make_ricambio(client, codice="R1")
    client.post(
        "/api/items",
        json={
            "sezione": "cosmetica",
            "codice": "COS-1",
            "descrizione": "Cera lucidante",
            "scaffale": "B1",
            "scatola": "1",
            "tipo_prodotto": "cera",
        },
    )

    response = client.get("/api/items", params={"sezione": "cosmetica"})
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["tipo_prodotto"] == "cera"


def test_carrozzeria_sezione_and_categorie_scoped(client):
    _make_ricambio(client, codice="R1", categoria="Golf GTI Mk1")
    client.post(
        "/api/items",
        json={
            "sezione": "carrozzeria",
            "descrizione": "Vernice rosso GTI",
            "categoria": "Vernice",
            "scaffale": "C1",
        },
    )

    response = client.get("/api/items", params={"sezione": "carrozzeria"})
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["categoria"] == "Vernice"

    categorie_carrozzeria = client.get(
        "/api/meta/categorie", params={"sezione": "carrozzeria"}
    ).json()
    assert categorie_carrozzeria == ["Vernice"]

    categorie_ricambi = client.get("/api/meta/categorie", params={"sezione": "ricambio"}).json()
    assert categorie_ricambi == ["Golf GTI Mk1"]


def test_scaffale_and_scatola_views(client):
    _make_ricambio(client, codice="A1", scaffale="S1", scatola="1")
    _make_ricambio(client, codice="A2", scaffale="S1", scatola="2")
    _make_ricambio(client, codice="B1", scaffale="S2", scatola="1")

    scaffali = client.get("/api/scaffali").json()
    assert {row["scaffale"]: row["numero_items"] for row in scaffali} == {"S1": 2, "S2": 1}

    scaffale_detail = client.get("/api/scaffali/S1").json()
    assert len(scaffale_detail["scatole"]) == 2

    scatola_items = client.get("/api/scatole/S1/1").json()
    assert len(scatola_items) == 1
    assert scatola_items[0]["codice"] == "A1"


def test_item_without_codice_or_scatola(client):
    response = _make_ricambio(client, codice=None, scatola=None, scaffale="S3")
    assert response.status_code == 201
    item_id = response.json()["id"]
    assert response.json()["codice"] is None
    assert response.json()["scatola"] is None

    scaffale_detail = client.get("/api/scaffali/S3").json()
    assert scaffale_detail["scatole"][0]["scatola"] == "Senza scatola"
    assert scaffale_detail["scatole"][0]["items"][0]["id"] == item_id

    senza_scatola_items = client.get("/api/scatole/S3/Senza scatola").json()
    assert len(senza_scatola_items) == 1
    assert senza_scatola_items[0]["id"] == item_id


def test_export_excel(client):
    _make_ricambio(client)
    response = client.get("/api/export/excel")
    assert response.status_code == 200
    assert (
        response.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert len(response.content) > 0
