import { sha256, toUtf8Bytes } from "ethers";
import { generateHash } from "./credential.js";
import { recoverSigner } from "./signature.js";

export async function verifySignedCredential(record, registry) {
  if (!record || !record.credential || !record.signature) return false;

  const { credential, signature } = record;

  let signer;
  try {
    signer = recoverSigner(credential, signature);
  } catch {
    return false;
  }

  const id = sha256(toUtf8Bytes(credential.id));
  const events = await registry.queryFilter("CredentialIssued");
  const issued = events.find(event => event.args[0] === id);

  if (!issued) return false;

  const issuer = issued.args[1];
  if (signer.toLowerCase() !== issuer.toLowerCase()) return false;

  return registry.isCredentialValid(
    id,
    "0x" + generateHash(credential)
  );
}
