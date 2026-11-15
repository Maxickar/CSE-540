import assert from "node:assert/strict";
import { network } from "hardhat";

const connection = await network.create();
const { ethers } = connection;
const [admin, university, student, other] = await ethers.getSigners();

function hash(text) {
  return ethers.sha256(ethers.toUtf8Bytes(text));
}

async function send(transaction) {
  const tx = await transaction;
  await tx.wait();
}

// Deploy both contracts.
const issuer = await ethers.deployContract("IssuerRegistry", [], admin);
await issuer.waitForDeployment();

const registry = await ethers.deployContract(
  "CredentialRegistry",
  [await issuer.getAddress()],
  admin
);
await registry.waitForDeployment();

const id = hash("credential-001");
const data = hash("Dummy Student: CS Degree");

// Approve the university and register the student.
await send(issuer.authorizeIssuer(university.address));
await send(registry.connect(student).registerDID(hash("student-001")));

// Issue a credential and check that it is valid.
await send(registry.connect(university).issueCredential(student.address, id, data));
assert.equal(await registry.isCredentialValid(id, data), true);
console.log("PASS: Credential is valid");

// Changed data should fail verification.
assert.equal(await registry.isCredentialValid(id, hash("changed")), false);
console.log("PASS: Changed data rejected");

// Another account should not be able to revoke it.
await assert.rejects(
  () => send(registry.connect(other).revokeCredential(id)),
  /Only the issuing university/
);
console.log("PASS: Unauthorized revocation blocked");

// Revoke it using the original issuer.
await send(registry.connect(university).revokeCredential(id));
assert.equal(await registry.isCredentialValid(id, data), false);
console.log("PASS: Revoked credential is invalid");

// Only the admin can approve universities.
await assert.rejects(
  () => send(issuer.connect(other).authorizeIssuer(other.address)),
  /Only admin/
);

// Unapproved accounts cannot issue credentials.
await assert.rejects(
  () => send(registry.connect(other).issueCredential(student.address, hash("new-id"), data)),
  /Not an approved university/
);

// A student cannot register a DID twice.
await assert.rejects(
  () => send(registry.connect(student).registerDID(hash("another-did"))),
  /DID already registered/
);

// A credential ID cannot be reused, even after revocation.
await assert.rejects(
  () => send(registry.connect(university).issueCredential(student.address, id, data)),
  /Credential ID already used/
);

console.log("PASS: Admin access, issuer access, and duplicate checks");

async function rejected(tx, reason) {
  await assert.rejects(() => send(tx), new RegExp(reason));
}

const zero = ethers.ZeroHash;
const missingId = hash("missing");
const newId = hash("credential-002");
const issuedByUniversity = registry.connect(university);

// Reject empty addresses and hashes.
await rejected(issuer.authorizeIssuer(ethers.ZeroAddress), "Invalid address");
await rejected(issuer.revokeIssuerAuthorization(ethers.ZeroAddress), "Invalid address");
await rejected(registry.connect(other).registerDID(zero), "Invalid DID hash");

await rejected(
  issuedByUniversity.issueCredential(ethers.ZeroAddress, newId, data),
  "Invalid student address"
);
await rejected(
  issuedByUniversity.issueCredential(student.address, zero, data),
  "Invalid credential ID"
);
await rejected(
  issuedByUniversity.issueCredential(student.address, newId, zero),
  "Invalid credential hash"
);

// A student must register a DID before receiving a credential.
await rejected(
  issuedByUniversity.issueCredential(other.address, newId, data),
  "Student has no DID"
);
console.log("PASS: Invalid inputs and missing DID rejected");

// Check missing credentials and repeated revocation.
assert.equal(await registry.isCredentialValid(missingId, data), false);
await rejected(
  issuedByUniversity.revokeCredential(missingId),
  "Credential does not exist"
);
await rejected(issuedByUniversity.revokeCredential(id), "Already revoked");
console.log("PASS: Missing credentials and repeated revocation handled");

// Check university approval rules.
await rejected(issuer.authorizeIssuer(university.address), "Already authorized");
await rejected(issuer.revokeIssuerAuthorization(other.address), "Not authorized");
await rejected(
  issuer.connect(other).revokeIssuerAuthorization(university.address),
  "Only admin"
);

// Create a valid credential before removing the university's approval.
await send(issuedByUniversity.issueCredential(student.address, newId, data));
assert.equal(await registry.isCredentialValid(newId, data), true);

// Record both successful and failed verification attempts.
await send(registry.connect(other).verifyAndLogCredential(newId, data));
await send(registry.connect(other).verifyAndLogCredential(newId, hash("changed")));

await send(issuer.revokeIssuerAuthorization(university.address));
assert.equal(await issuer.isAuthorizedIssuer(university.address), false);
assert.equal(await registry.isCredentialValid(newId, data), false);
console.log("PASS: Removing university approval invalidates its credential");

// Check event values from this run.
async function checkEvents(contract, name, expected) {
  const events = await contract.queryFilter(name);
  assert.deepEqual(events.map(event => Array.from(event.args)), expected);
}

await checkEvents(issuer, "IssuerAuthorized", [
  [university.address]
]);
await checkEvents(issuer, "IssuerAuthorizationRevoked", [
  [university.address]
]);
await checkEvents(registry, "DIDRegistered", [
  [student.address, hash("student-001")]
]);
await checkEvents(registry, "CredentialIssued", [
  [id, university.address, student.address],
  [newId, university.address, student.address]
]);
await checkEvents(registry, "CredentialRevoked", [
  [id]
]);
await checkEvents(registry, "CredentialVerified", [
  [newId, other.address, true],
  [newId, other.address, false]
]);
console.log("PASS: All six event types contain the expected values");

await connection.close();
