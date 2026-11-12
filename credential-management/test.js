
const {
    createCredential,
    generateHash,
    saveCredential,
    getCredential,
    verifyCredential
} = require("./credential");

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
