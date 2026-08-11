import os
import tempfile

import pytest

_tmp_data_dir = tempfile.mkdtemp(prefix="mauri_garage_test_")
os.environ["DATA_DIR"] = _tmp_data_dir
os.environ["APP_PASSWORD"] = ""

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return TestClient(app)
