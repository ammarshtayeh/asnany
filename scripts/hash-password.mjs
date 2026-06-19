import { pbkdf2Sync, randomBytes } from "crypto";

const password = process.argv[2] || "amm marking123";
const PREFIX = "pbkdf2_sha256";
const ITER = 120000;
const salt = randomBytes(16).toString("base64url");
const hash = pbkdf2Sync(password, salt, ITER, 32, "sha256").toString("base64url");
console.log(`${PREFIX}$${ITER}$${salt}$${hash}`);
