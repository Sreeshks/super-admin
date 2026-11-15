import jwt
import pytest

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    hash_token,
    verify_password,
)


def test_argon2_password_hashing():
    raw_password = "SuperSecretPassword@123"
    hashed = hash_password(raw_password)

    assert hashed != raw_password
    assert hashed.startswith("$argon2id$")
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_access_token_creation_and_decoding():
    subject = "123e4567-e89b-12d3-a456-426614174000"
    claims = {"email": "test@domain.com", "roles": ["COMPANY_ADMIN"]}
    token = create_access_token(subject=subject, claims=claims)

    decoded = decode_access_token(token)
    assert decoded["sub"] == subject
    assert decoded["email"] == "test@domain.com"
    assert decoded["roles"] == ["COMPANY_ADMIN"]
    assert decoded["type"] == "access"


def test_jwt_algorithm_forgery_rejected():
    # Attempt to forge token with "none" algorithm
    payload = {"sub": "fake-admin", "type": "access", "iat": 1000, "exp": 9999999999}
    unsecured_token = jwt.encode(payload, key="", algorithm="none")

    with pytest.raises(jwt.PyJWTError):
        decode_access_token(unsecured_token)


def test_hash_token_sha256():
    token = "random-refresh-token-value"
    token_hash = hash_token(token)
    assert len(token_hash) == 64
    assert token_hash == hash_token(token)
