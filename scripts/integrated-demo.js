import fs from "node:fs";
import assert from "node:assert/strict";
import { network } from "hardhat";
import {
  createCredential,
  generateHash
} from "../credential-management/credential.js";
import {
  signCredential
} from "../credential-management/signature.js";
import {
  saveSignedCredential,
  getSignedCredential
} from "../credential-management/signed-storage.js";
import {
  verifySignedCredential
} from "../credential-management/verification.js";

// Read our simple CSV, without quoted fields or commas inside values.
const file = new URL("../data/demo-credentials.csv", import.meta.url);
const rows = fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1);
assert.equal(rows.length, 20, "Expected 20 credentials");

const connection = await network.create();
const { ethers } = connection;
const [admin, university, verifier, other, ...students] =
  await ethers.getSigners();

function hash(text) {
  return ethers.sha256(ethers.toUtf8Bytes(text));
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

// Approve a second university to test a wrong issuer's signature.
await send(issuer.authorizeIssuer(other.address));

const wallets = new Map();
const records = [];

async function verify(record) {
  return verifySignedCredential(record, registry.connect(verifier));
}

// Create, sign, save, and issue each credential.
for (const row of rows) {
  const [, studentId, universityName, degree] = row.split(",");
  assert.equal(universityName, "Demo University");

  if (!wallets.has(studentId)) {
    const wallet = students[wallets.size];
    assert.ok(wallet, "Not enough test accounts");
    wallets.set(studentId, wallet);
    await send(registry.connect(wallet).registerDID(hash(studentId)));
  }

  const credential = createCredential(studentId, universityName, degree);
  const signature = await signCredential(credential, university);

  saveSignedCredential(credential, signature);

  await send(registry.connect(university).issueCredential(
    wallets.get(studentId).address,
    hash(credential.id),
    "0x" + generateHash(credential)
  ));

  const stored = getSignedCredential(credential.id);
  assert.equal(await verify(stored), true);
  records.push(stored);
}

console.log(`Signed, saved, issued, and verified ${records.length} credentials.`);
console.log(`Registered ${wallets.size} students.`);

const [first, second, third] = records;

// Original credential.
const original = await verify(first);

// Changed data with the original signature.
const changed = await verify({
  credential: { ...second.credential, degree: "Doctor of Medicine" },
  signature: second.signature
});

// A different approved university signs the same data.
const wrongSigner = await verify({
  credential: first.credential,
  signature: await signCredential(first.credential, other)
});

// Invalid signature format.
const invalidSignature = await verify({
  credential: first.credential,
  signature: "0x1234"
});

// Correct signature, but the credential has been revoked.
await send(
  registry.connect(university).revokeCredential(hash(third.credential.id))
);
const revoked = await verify(third);

assert.equal(original, true);
assert.equal(changed, false);
assert.equal(wrongSigner, false);
assert.equal(invalidSignature, false);
assert.equal(revoked, false);

console.table([
  { scenario: "Original", valid: original },
  { scenario: "Changed degree", valid: changed },
  { scenario: "Wrong signer", valid: wrongSigner },
  { scenario: "Invalid signature", valid: invalidSignature },
  { scenario: "Revoked", valid: revoked }
]);

await connection.close();
