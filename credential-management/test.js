
import {
    createCredential,
    generateHash,
    saveCredential,
    getCredential,
    verifyCredential
} from "./credential.js";

const credential = createCredential(
    "STUDENT-001",
    "Arizona State University",
    "Bachelor of Science in Computer Science"
);

console.log("Created Credential:", credential);

saveCredential(credential);
console.log("Credential saved successfully!");

const stored = getCredential(credential.id);
console.log("Retrieved Credential:", stored);

const isValid = verifyCredential(credential.id);
console.log("Credential Integrity Valid:", isValid);
