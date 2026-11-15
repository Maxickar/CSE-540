import { getBytes, verifyMessage } from "ethers";
import { generateHash } from "./credential.js";

export async function signCredential(credential, university) {
  const hash = "0x" + generateHash(credential);
  return university.signMessage(getBytes(hash));
}

export function recoverSigner(credential, signature) {
  const hash = "0x" + generateHash(credential);
  return verifyMessage(getBytes(hash), signature);
}
