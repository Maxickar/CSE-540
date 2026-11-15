import fs from "node:fs";
import assert from "node:assert/strict";
import { network } from "hardhat";

// Read the demo CSV. Values must not contain commas or quotes.
const file = new URL("../data/demo-credentials.csv", import.meta.url);
const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);

const credentials = lines.slice(1).map(line => {
  const [id, studentId, university, degree, issuedAt] = line.split(",");
  return { id, studentId, university, degree, issuedAt };
});

assert.ok(credentials.length >= 3, "Need at least three credentials");

const connection = await network.create();
const { ethers } = connection;
const [admin, university, verifier, ...students] = await ethers.getSigners();

function hash(value) {
  return ethers.sha256(ethers.toUtf8Bytes(value));
}

function credentialHash(credential) {
  return hash(JSON.stringify(credential));
}

async function send(transaction) {
  const tx = await transaction;
  await tx.wait();
}

// Deploy the contracts.
const issuer = await ethers.deployContract("IssuerRegistry", [], admin);
await issuer.waitForDeployment();

const registry = await ethers.deployContract(
  "CredentialRegistry", [await issuer.getAddress()], admin
);
await registry.waitForDeployment();

await send(issuer.authorizeIssuer(university.address));

async function verify(credential) {
  return registry.connect(verifier).isCredentialValid(
    hash(credential.id), credentialHash(credential)
  );
}

// Register each student once, then issue their credentials.
const wallets = new Map();

for (const credential of credentials) {
  const studentId = credential.studentId;

  if (!wallets.has(studentId)) {
    const wallet = students[wallets.size];
    assert.ok(wallet, "Not enough student accounts");
    wallets.set(studentId, wallet);
    await send(registry.connect(wallet).registerDID(hash(studentId)));
  }

  await send(registry.connect(university).issueCredential(
    wallets.get(studentId).address,
    hash(credential.id),
    credentialHash(credential)
  ));

  assert.equal(await verify(credential), true);
}

console.log(`Issued and verified ${credentials.length} credentials.`);
console.log(`Registered ${wallets.size} students.`);

// Compare original, changed, and revoked credentials.
const [original, second, third] = credentials;
const changed = { ...second, degree: "Doctor of Medicine" };

const valid = await verify(original);
const tampered = await verify(changed);

await send(registry.connect(university).revokeCredential(hash(third.id)));
const revoked = await verify(third);

assert.equal(valid, true);
assert.equal(tampered, false);
assert.equal(revoked, false);

console.table([
  { id: original.id, scenario: "Original", valid },
  { id: second.id, scenario: "Changed degree", valid: tampered },
  { id: third.id, scenario: "Revoked", valid: revoked }
]);

await connection.close();
