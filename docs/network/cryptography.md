---
description: 用机制图与可运行代码，分清 AES 模式、RSA、ECC、口令派生和证书。
outline: [2, 3]
---

# 密码学与密钥：从“锁住一条消息”到选对算法

发送 `amount=100`：别人能读吗？改成 `900` 能发现吗？谁能生成合法的认证值？**保密、完整性、身份认证，是三个问题。** 前置：[HTTP](./http.html)；后续：[TLS](./tls.html)。金额只是教学输入。

## 1. 先问目标，再选工具 {#goals}

![编码、摘要和 HMAC 各自改变什么，接收方如何验证](/assets/network/crypto-message-tools.svg)

**能还原不代表保密；发现变化也不代表知道是谁发送的。** 隐藏内容通常用 AEAD；证明持有某个可信公钥对应的私钥用签名；隔网协商秘密用经过身份认证的密钥交换。

## 2. 先分清最容易混用的六个词 {#tools}

`Base64` 是编码；`SHA-256` 是摘要；`HMAC` 是带密钥的认证；`AES` 是分组密码；`ECDH` 是协商；`ECDSA` 是签名。名字不同，保护目标也不同。

### 为什么只校验 SHA-256 不一定安全

如果文件与摘要从同一条不可信通道取得，对方可以一起替换。摘要要来自可信渠道，或验证可信公钥的签名。断点续传的资源校验还需结合 [ETag 与 Range](../android/libraries/okhttp.html#resumable-download)。

### 数字签名不是“私钥加密”

![共享密钥认证的双方都能生成标签；数字签名由私钥生成、可信公钥验证](/assets/network/crypto-authentication-roles.svg)

**签名不隐藏内容。** 验证只证明与该公钥对应的私钥生成了签名；公钥属于谁，需要可信分发或证书认证。RSA 签名也有专门编码，不能反用加密接口。[RFC 8017 §7–9](https://www.rfc-editor.org/rfc/rfc8017.html#section-7)

## 3. AES：分组引擎与工作模式 {#keys}

AES（高级加密标准）每次处理 **128 bit = 16 字节**。AES-128 / 192 / 256 指密钥长度，不是分组长度。[FIPS 197](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf)

![AES 轮变换与密钥扩展，以及 ECB、CBC、CTR 如何组织多个分组](/assets/network/crypto/aes-block-modes.svg)

**AES 处理一个分组；模式决定整段消息怎样处理。** 加密先加轮密钥，再做多轮字节替换、行移位、列混合、加轮密钥；最后一轮省略列混合。轮密钥来自 key expansion，不是每轮重新随机选钥。[FIPS 197 §5](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf)

### ECB、CBC、CTR：改变的是分组之间的关系

- **ECB（电子密码本）**：各块独立处理。同一密钥下，相同明文块产生相同密文块，泄漏重复模式，不用于普通消息加密。
- **CBC（密文分组链接）**：先将当前明文与上一密文块异或，再加密；首块用 IV。AES 的 IV 为 16 字节，必须不可预测；可以公开，但也要保护完整性。
- **CTR（计数器）**：AES 加密计数器块生成密钥流，再与明文异或。同一 key 下，跨消息的**所有计数器块都不能重复**；起点不同但区间重叠也不行。

基础 CBC、CTR **不提供认证**。CBC 处理完整分组，任意长度输入常配 PKCS#7；CTR 无需填充。优先使用成熟 AEAD，不自己拼新协议。[NIST SP 800-38A §6、附录 B/C](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf)

### 参数要与模式一起读

`AES-CBC(key, IV)` 和 `AES-CTR(key, initial_counter)` 不遵循同一种 IV 规则。Python `modes.CTR(nonce)` 虽然把参数叫 nonce，AES 下传入的是 **16 字节初始计数器块**，不同于下节 GCM 的 12 字节 nonce。[官方 API](https://cryptography.io/en/stable/hazmat/primitives/symmetric-encryption/)

## 4. AEAD：加密和认证一起做 {#aead}

**AEAD = 带关联数据的认证加密。** 接收方验证成功才向业务交付明文，失败就拒绝。

![AEAD 的 key、nonce、AAD 与明文各自进入哪里，以及认证失败后拒绝交付](/assets/network/crypto/aead-parameters.svg)

**AAD 不保密但被认证；nonce 不必保密，却必须按规则唯一。**

### AES-GCM 与 ChaCha20-Poly1305

AES-GCM 结合计数器加密与认证；ChaCha20-Poly1305 结合 ChaCha20 流密码与 Poly1305 认证。两者都是 AEAD，库已经封装，不需手动 padding。[SP 800-38D](https://csrc.nist.gov/pubs/sp/800/38/d/final)、[RFC 8439 §2.8](https://www.rfc-editor.org/rfc/rfc8439.html#section-2.8)

示例用 **12 字节 nonce、16 字节 tag**。AES 密钥可为 16/24/32 字节；这里选 32。ChaCha20-Poly1305 密钥固定 32 字节，不能与低层 `ChaCha20` 的 nonce 布局混用。[已验证版本的 API](https://cryptography.io/en/40.0.1/hazmat/primitives/aead/)

依赖：`python -m pip install cryptography`。以下公共 API 已在 Python 3.11.6 / cryptography 40.0.1 执行，不要求安装该旧版本。

```python
import os
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305

for algorithm in (AESGCM, ChaCha20Poly1305):
    key = (algorithm.generate_key(bit_length=256) if algorithm is AESGCM
           else algorithm.generate_key())
    cipher = algorithm(key)
    nonce = os.urandom(12)
    aad = b"type=note;version=1"  # 可见头部，也需要防篡改。
    plaintext = b"amount=100"
    sealed = cipher.encrypt(nonce, plaintext, aad)  # 已附 16 字节 tag。
    assert cipher.decrypt(nonce, sealed, aad) == plaintext
    assert len(sealed) == len(plaintext) + 16
    changed = bytes([sealed[0] ^ 1]) + sealed[1:]
    try:
        cipher.decrypt(nonce, changed, aad)
    except InvalidTag:
        print(algorithm.__name__, "tamper rejected")
    else:
        raise AssertionError("tamper accepted")
```

**同一 key + nonce 不能复用。** 示例随机生成 nonce；生产还要考虑碰撞概率、单密钥用量、重启和多节点分配。计数法要管理状态与分区，随机法要限制用量，不是“随机就绝不重复”。[SP 800-38D §8](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)

### TLS 怎样避免随手生成 nonce

TLS 1.3 从各方向 traffic secret 派生 key、IV，再用 IV 与补齐长度的记录序号异或生成 nonce。不是每条记录重新随机，也不是直接把 traffic secret 当 AES key。见 [TLS 密钥调度](./tls.html#traffic)。[RFC 8446 §5.3 / §7.3](https://www.rfc-editor.org/rfc/rfc8446.html#section-5.3)

## 5. RSA：加密 OAEP，签名 PSS {#rsa}

![RSA-OAEP 包装短秘密与 RSA-PSS 签名分开；编码层先于模幂运算](/assets/network/crypto/rsa-two-roles.svg)

**大数据交给 AEAD；OAEP 通常包装随机数据密钥；PSS 处理签名。** RSA 的底层是模幂运算，但 OAEP/PSS 是各有安全目标的随机化编码，不是把字符串补齐，也不能省掉编码直接做裸 RSA。[RFC 8017 §5、§7、§9](https://www.rfc-editor.org/rfc/rfc8017.html#section-5)

```python
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

encryption_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
oaep = padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),
                    algorithm=hashes.SHA256(), label=None)
data_key = os.urandom(32)  # 包装密钥，不是整个文件。
wrapped = encryption_key.public_key().encrypt(data_key, oaep)
assert encryption_key.decrypt(wrapped, oaep) == data_key

signing_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
pss = padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                  salt_length=hashes.SHA256().digest_size)
message = b"release-manifest:v1"
signature = signing_key.sign(message, pss, hashes.SHA256())
# 成功返回 None，失败抛 InvalidSignature；公钥必须可信。
signing_key.public_key().verify(signature, message, pss, hashes.SHA256())
print("OAEP and PSS passed")
```

OAEP 上限为 `k − 2×hLen − 2` 字节，k 是模数字节长度；上例 `256 − 64 − 2 = 190`，191 字节会失败。双方要约定 OAEP 哈希、MGF1 哈希、label；PSS 要兼容盐长度策略。2048 位是教学参数，不是所有寿命与合规要求的永久答案。[RFC 8017 §7.1 / §9.1](https://www.rfc-editor.org/rfc/rfc8017.html#section-7.1)

## 6. ECC 是体系，ECDH 与 ECDSA 分工不同 {#ecc}

![ECC 协商通过两次点乘得到同一共享点，签名走独立路线](/assets/network/crypto/ecc-role-map.svg)

**ECC（椭圆曲线密码学）不能简单理解为“另一种 RSA 加解密”。** ECDH 是椭圆曲线 Diffie–Hellman 协商，ECDSA 是椭圆曲线数字签名；X25519 是基于 Curve25519 的协商函数，Ed25519 是 EdDSA 签名方案。它们不能互换。[RFC 7748](https://www.rfc-editor.org/rfc/rfc7748.html)、[RFC 8032](https://www.rfc-editor.org/rfc/rfc8032.html)

### ECDH / X25519：公开值过网络，共享秘密留本机

```python
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec, x25519
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

alice = ec.generate_private_key(ec.SECP256R1())
bob = ec.generate_private_key(ec.SECP256R1())
secret_a = alice.exchange(ec.ECDH(), bob.public_key())
secret_b = bob.exchange(ec.ECDH(), alice.public_key())
assert secret_a == secret_b

def derive(secret):
    return HKDF(algorithm=hashes.SHA256(), length=32, salt=None,
                info=b"note-demo/client-to-server/v1").derive(secret)

assert derive(secret_a) == derive(secret_b)
x = x25519.X25519PrivateKey.generate()
y = x25519.X25519PrivateKey.generate()
assert x.exchange(y.public_key()) == y.exchange(x.public_key())
print("agreement and derivation passed")
```

这里只有运算，**没认证对端公钥，不能防止冒充**。实际优先使用 TLS 等已有认证、上下文绑定、密钥确认的协议，不自行拼安全传输。一般 ECDH 的点乘图是理解桥梁；X25519 API 使用专门编码与运算，不能拿任意 EC 公钥字节直接互换。[ECDH API](https://cryptography.io/en/stable/hazmat/primitives/asymmetric/ec/#elliptic-curve-key-exchange-algorithm)

### ECDSA / Ed25519：用另一把私钥签名

```python
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec, ed25519

message = b"release-manifest:v1"
ec_signer = ec.generate_private_key(ec.SECP256R1())  # 不复用 ECDH 密钥。
signature = ec_signer.sign(message, ec.ECDSA(hashes.SHA256()))
ec_signer.public_key().verify(signature, message, ec.ECDSA(hashes.SHA256()))

ed_signer = ed25519.Ed25519PrivateKey.generate()
signature = ed_signer.sign(message)  # 不另传 SHA256 参数。
ed_signer.public_key().verify(signature, message)
try:
    ed_signer.public_key().verify(signature, message + b"changed")
except InvalidSignature:
    print("changed message rejected")
else:
    raise AssertionError("changed message accepted")
```

ECDSA 每次签名有秘密值 `k`，泄漏或错误复用可能暴露私钥；它不是 AEAD 中公开的 nonce。交给成熟库处理，勿自己传随机值或复用中间值。同一 EC 密钥不要兼做签名与 ECDH。[EC API](https://cryptography.io/en/stable/hazmat/primitives/asymmetric/ec/)、[RFC 8032 §5.1.6](https://www.rfc-editor.org/rfc/rfc8032.html#section-5.1.6)

## 7. 密钥交换后，为什么还要 HKDF {#hkdf}

![协商秘密经提取、扩展和用途分隔，得到匹配的方向密钥](/assets/network/crypto-exchange-derivation.svg)

**共享秘密是原料，应用密钥是分用途的成品。** HKDF 先 Extract 提取，再 Expand 扩展；`info` 绑定用途，分开不同方向或功能。两端必须约定相同参数和字节编码。[RFC 5869 §2](https://www.rfc-editor.org/rfc/rfc5869.html#section-2)

`salt`、`info` 不必保密；代码 `salt=None` 只是最小示例，不是 TLS 完整调度。HKDF 不凭空增加熵，不能用来替代口令加固。

### 前向保密怎样理解

临时 ECDHE 经正确认证并及时销毁临时秘密后，未来泄漏长期身份私钥，不应直接解开旧录包。静态 RSA 密钥传输没有这种性质；TLS 1.3 的 0-RTT 早期数据也没有完整前向保密保证，另有重放风险。[TLS 边界](./tls.html#handshake)

## 8. PBKDF2：让每次猜口令更贵 {#pbkdf2}

![PBKDF2 每个输出块反复调用 PRF 并异或，HKDF 则提取和分隔高熵秘密](/assets/network/crypto/password-vs-hkdf.svg)

PBKDF2 是基于口令的密钥派生函数。**它不把弱口令变随机，而靠迭代抬高猜测成本；HKDF 负责另一件事。** PRF 是伪随机函数，本例为 HMAC-SHA256；输出块由多个迭代结果异或得到，再拼接、截取到目标长度。[RFC 8018 §5.2](https://www.rfc-editor.org/rfc/rfc8018.html#section-5.2)

### 口令不能直接当随机密钥

`SHA256(password)` 太快；补零或截断不增加口令熵。PBKDF2 要明确 **口令编码、随机 salt、PRF、iterations、输出长度**。盐隔离不同记录和预计算，不阻止针对单个弱口令的猜测。

```python
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

def derive_password_key(password: str, salt: bytes, iterations: int) -> bytes:
    if iterations < 1:
        raise ValueError("iterations must be positive")
    # 每次新建 KDF；derive/verify 的上下文不能复用。
    return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt,
                     iterations=iterations).derive(password.encode("utf-8"))

cost = int(input("PBKDF2 experiment iterations (not production advice): "))
salt = os.urandom(16)
key = derive_password_key("a-demo-passphrase", salt, cost)
assert key == derive_password_key("a-demo-passphrase", salt, cost)
assert key != derive_password_key("wrong-passphrase", salt, cost)
print("password derivation passed")
```

文件加密保存版本、KDF、盐、PRF、次数、输出长度，以及 AEAD nonce / 密文 / tag；**不要连派生解密密钥一起保存**。登录验证是另一种用途，应使用专门的口令存储与验证方案，不把解密密钥当通用登录记录。[NIST SP 800-132 §5](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf)

次数应按设备、延迟预算、安全要求实测并可迁移，不能固定抄一个数字当永久生产规范。读取不可信文件时还应限制 KDF 工作量，避免对方强制执行极高成本。

## 9. 动手：相同数据、篡改数据与 HMAC {#practice}

```python
import base64
import hashlib
import hmac
import secrets

message = b"amount=100&currency=CNY"
changed = b"amount=900&currency=CNY"
key = secrets.token_bytes(32)
assert base64.b64decode(base64.b64encode(message)) == message
assert hashlib.sha256(message).digest() != hashlib.sha256(changed).digest()
tag = hmac.digest(key, message, "sha256")
assert hmac.compare_digest(tag, hmac.digest(key, message, "sha256"))
assert not hmac.compare_digest(tag, hmac.digest(key, changed, "sha256"))
print("encoding/hash/HMAC passed")
```

### HMAC 正确，不代表请求不会重放

原样重发，HMAC 仍可正确。业务还需序号、时间窗口、请求标识和服务端去重，并把这些字段纳入认证。共享密钥双方都能生成 HMAC，不能向第三方证明究竟由哪方生成。[RFC 2104](https://www.rfc-editor.org/rfc/rfc2104.html)

## 10. 证书：给公钥附上可验证身份 {#certificates}

![站点保留私钥并提交 CSR，CA 校验签发，客户端基于自身信任锚验证](/assets/network/crypto/certificate-role-overview.svg)

**证书绑定身份和公钥，不装私钥，不批准业务权限。** CSR 签名证明私钥持有，CA 还要另验申请资格；服务器发来的根证书不会自动变成信任锚。[RFC 5280 §6](https://www.rfc-editor.org/rfc/rfc5280.html#section-6)

字段、信任链和权限边界见 [证书验证](./tls.html#certificates)；生成私钥、申请、部署和续期见 [证书签发流程](./tls.html#certificate-issuance)。

## 11. 密钥的一生，比算法名字更重要 {#lifecycle}

生成用密码学安全随机源；存储用平台密钥库或受控密钥服务；分发确认身份；不同用途分钥；轮换记录 key ID 并迁移旧数据；泄漏后撤销与替换。

**私钥、口令、解密密钥不进仓库、前端包、日志或公开附件。** 本页密钥仅在内存生成，不落盘。长期密钥另需权限、备份和销毁设计。

## 12. 最容易踩的坑 {#pitfalls}

- AES 选 ECB；只加密不认证；GCM 重复 nonce。
- RSA 加密大文件，把签名叫私钥加密；ECDH 不认证公钥。
- ECDSA 秘密值 `k` 与 AEAD 公开 nonce 混用；签名与协商共钥。
- 弱口令却以为 AES-256 自动有 256 位安全；PBKDF2 次数永久写死。

## 13. 自测 {#check}

[下载完整可运行练习](/assets/network/crypto/crypto_examples.py){download="crypto_examples.py"}。不保存私钥；PBKDF2 次数通过参数传入，不预设生产值。

```sh
python crypto_examples.py --pbkdf2-iterations YOUR_MEASURED_ITERATIONS
```

将占位符替换为自己试验的正整数。练习验证往返、密文/AAD 篡改、验签失败、OAEP 超限、协商与派生一致，只输出结果，不输出秘密。

能解释四点，就抓住主线：**AES 分组长度为何不等于密钥长度；GCM 为什么怕 nonce 重复；ECDH 为什么还缺认证；PBKDF2 为什么不能换成 HKDF。**
