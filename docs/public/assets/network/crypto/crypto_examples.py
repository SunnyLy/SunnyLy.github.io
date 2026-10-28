"""Local cryptography exercises. Requires Python 3.11+ and cryptography.

Run: python -B crypto_examples.py --pbkdf2-iterations YOUR_MEASURED_ITERATIONS
All keys are ephemeral, in memory. No files/network/secret output.
This demonstrates primitives, not a new transport or storage protocol.
The iteration count is an explicit experiment input, not production advice.
"""

import argparse
import base64
import hashlib
import hmac
import os
from cryptography.exceptions import InvalidSignature, InvalidTag
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec, ed25519, padding, rsa, x25519
from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


def must_reject(exception, operation):
    try:
        operation()
    except exception:
        return
    raise AssertionError("Invalid data was unexpectedly accepted")


def check_foundations():
    message = b"amount=100&currency=CNY"
    changed = b"amount=900&currency=CNY"
    key = os.urandom(32)
    assert base64.b64decode(base64.b64encode(message)) == message
    assert hashlib.sha256(message).digest() != hashlib.sha256(changed).digest()
    tag = hmac.digest(key, message, "sha256")
    assert hmac.compare_digest(tag, hmac.digest(key, message, "sha256"))
    assert not hmac.compare_digest(tag, hmac.digest(key, changed, "sha256"))
    assert not hmac.compare_digest(tag, hmac.digest(os.urandom(32), message, "sha256"))
    print("PASS encoding/hash/HMAC: changed message and wrong key")


def check_aead():
    for algorithm in (AESGCM, ChaCha20Poly1305):
        key = (algorithm.generate_key(bit_length=256) if algorithm is AESGCM
               else algorithm.generate_key())
        cipher = algorithm(key)
        nonce, aad, plaintext = os.urandom(12), b"type=note;version=1", b"amount=100"
        sealed = cipher.encrypt(nonce, plaintext, aad)
        assert cipher.decrypt(nonce, sealed, aad) == plaintext
        assert len(sealed) == len(plaintext) + 16
        changed = bytes([sealed[0] ^ 1]) + sealed[1:]
        must_reject(InvalidTag, lambda: cipher.decrypt(nonce, changed, aad))
        must_reject(InvalidTag, lambda: cipher.decrypt(nonce, sealed, aad + b"changed"))
        other_nonce = bytes([nonce[0] ^ 1]) + nonce[1:]
        must_reject(InvalidTag, lambda: cipher.decrypt(other_nonce, sealed, aad))
        must_reject(InvalidTag, lambda: algorithm(os.urandom(32)).decrypt(nonce, sealed, aad))
        print("PASS", algorithm.__name__, "roundtrip/tamper/AAD/nonce/wrong-key")


def check_rsa():
    encryption_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    oaep = padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),
                        algorithm=hashes.SHA256(), label=None)
    data_key = os.urandom(32)
    wrapped = encryption_key.public_key().encrypt(data_key, oaep)
    assert encryption_key.decrypt(wrapped, oaep) == data_key
    limit = encryption_key.key_size // 8 - 2 * hashes.SHA256().digest_size - 2
    assert limit == 190
    maximum = b"x" * limit
    assert encryption_key.decrypt(encryption_key.public_key().encrypt(maximum, oaep), oaep) == maximum
    must_reject(ValueError, lambda: encryption_key.public_key().encrypt(b"x" * (limit + 1), oaep))
    signing_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pss = padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=hashes.SHA256().digest_size)
    message = b"release-manifest:v1"
    signature = signing_key.sign(message, pss, hashes.SHA256())
    signing_key.public_key().verify(signature, message, pss, hashes.SHA256())
    must_reject(InvalidSignature, lambda: signing_key.public_key().verify(
        signature, message + b"changed", pss, hashes.SHA256()))
    print("PASS RSA-OAEP 190-byte boundary / RSA-PSS changed-message rejection")


def hkdf(secret, info):
    return HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=info).derive(secret)


def check_ecc_and_hkdf():
    alice = ec.generate_private_key(ec.SECP256R1())
    bob = ec.generate_private_key(ec.SECP256R1())
    secret_a = alice.exchange(ec.ECDH(), bob.public_key())
    secret_b = bob.exchange(ec.ECDH(), alice.public_key())
    assert secret_a == secret_b
    info = b"note-demo/client-to-server/v1"
    assert hkdf(secret_a, info) == hkdf(secret_b, info)
    assert hkdf(secret_a, info) != hkdf(secret_a, b"note-demo/server-to-client/v1")
    x, y = x25519.X25519PrivateKey.generate(), x25519.X25519PrivateKey.generate()
    assert x.exchange(y.public_key()) == y.exchange(x.public_key())
    ec_signer = ec.generate_private_key(ec.SECP256R1())
    message = b"release-manifest:v1"
    signature = ec_signer.sign(message, ec.ECDSA(hashes.SHA256()))
    ec_signer.public_key().verify(signature, message, ec.ECDSA(hashes.SHA256()))
    must_reject(InvalidSignature, lambda: ec_signer.public_key().verify(
        signature, message + b"changed", ec.ECDSA(hashes.SHA256())))
    ed_signer = ed25519.Ed25519PrivateKey.generate()
    signature = ed_signer.sign(message)
    ed_signer.public_key().verify(signature, message)
    must_reject(InvalidSignature, lambda: ed_signer.public_key().verify(signature, message + b"changed"))
    print("PASS ECDH/X25519/HKDF direction separation/ECDSA/Ed25519")


def derive_password_key(password, salt, iterations):
    if iterations < 1:
        raise ValueError("iterations must be positive")
    return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt,
                     iterations=iterations).derive(password.encode("utf-8"))


def check_pbkdf2(iterations):
    salt = os.urandom(16)
    key = derive_password_key("a-demo-passphrase", salt, iterations)
    assert key == derive_password_key("a-demo-passphrase", salt, iterations)
    assert key != derive_password_key("wrong-passphrase", salt, iterations)
    other_salt = bytes([salt[0] ^ 1]) + salt[1:]
    assert key != derive_password_key("a-demo-passphrase", other_salt, iterations)
    must_reject(ValueError, lambda: derive_password_key("a-demo-passphrase", salt, 0))
    verifier = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=iterations)
    verifier.verify(b"a-demo-passphrase", key)
    print("PASS PBKDF2 explicit experiment cost / salt / wrong password / verify")


def positive_int(value):
    parsed = int(value)
    if parsed < 1:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return parsed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pbkdf2-iterations", type=positive_int, required=True,
                        help="explicit local experiment cost; not a production recommendation")
    args = parser.parse_args()
    check_foundations()
    check_aead()
    check_rsa()
    check_ecc_and_hkdf()
    check_pbkdf2(args.pbkdf2_iterations)
    print("ALL PASS. No files, network requests or private-key output.")


if __name__ == "__main__":
    main()
