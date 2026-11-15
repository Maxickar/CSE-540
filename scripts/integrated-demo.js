import fs from "node:fs";
import assert from "node:assert/strict";
import { network } from "hardhat";
import {
  createCredential,
  generateHash,
  saveCredential,
  getCredential
} from "../credential-management/credential.js";

const file = new URL("../data/demo-credentials.csv", import.meta.url);
const rows = fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1);

const connection = await network.create();
const { ethers } = connection;
const [admin, university, verifier, ...students] = await ethers.getSigners();

function hash(text) {
  return ethers.sha256(ethers.toUtf8Bytes(text));
}

async function send(transaction) {
  const tx = await transaction;
  await tx.wait();
}

const issuer = await ethers.deployContract("IssuerRegistry", [], admin);
await issuer.waitForDeployment();

const registry = await ethers.deployContract(
  "CredentialRegistry", [await issuer.getAddress()], admin
);
await registry.waitForDeployment();

async function verify(credential) {
  return registry.connect(verifier).isCredentialValid(
    hash(credential.id),
    "0x" + generateHash(credential)
  );
}

await send(issuer.authorizeIssuer(university.address));

const wallets = new Map();
const credentials = [];

// Read the CSV and register each student once.
for (const row of rows) {
  const [csvId, studentId, universityName, degree] = row.split(",");

  if (!wallets.has(studentId)) {
    const wallet = students[wallets.size];
    assert.ok(wallet, "Not enough test accounts");
    wallets.set(studentId, wallet);
    await send(registry.connect(wallet).registerDID(hash(studentId)));
  }

  // Nawaf's function creates a new ID and issue date.
  const credential = createCredential(studentId, universityName, degree);
  saveCredential(credential);

  await send(registry.connect(university).issueCredential(
    wallets.get(studentId).address,
    hash(credential.id),
    "0x" + generateHash(credential)
  ));

  const stored = getCredential(credential.id);
  assert.ok(stored, "Credential not found");
  assert.equal(await verify(stored.credential), true);
  credentials.push(stored.credential);
}

console.log(`Saved, issued, and verified ${credentials.length} credentials.`);
console.log(`Registered ${wallets.size} students.`);

assert.ok(credentials.length >= 3, "Need at least three credentials");
const [first, second, third] = credentials;

// Check original, changed, and revoked credentials.
const original = await verify(first);
const changed = await verify({ ...second, degree: "Doctor of Medicine" });

await send(registry.connect(university).revokeCredential(hash(third.id)));
const revoked = await verify(third);

assert.equal(original, true);
assert.equal(changed, false);
assert.equal(revoked, false);

console.table([
  { scenario: "Original", valid: original },
  { scenario: "Changed degree", valid: changed },
  { scenario: "Revoked", valid: revoked }
]);

await connection.close();
