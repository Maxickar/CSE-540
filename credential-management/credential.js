
const crypto = require("node:crypto");
const fs = require("node:fs");

const FILE = "credentials.json";

function createCredential(studentId, university, degree) {
    return {
        id: crypto.randomUUID(),
        studentId,
        university,
        degree,
        issuedAt: new Date().toISOString()
    };
}

function generateHash(credential) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(credential))
        .digest("hex");
}

function saveCredential(credential) {
    let credentials = [];

    if (fs.existsSync(FILE)) {
        credentials = JSON.parse(
            fs.readFileSync(FILE, "utf8")
        );
    }

    credentials.push({
        credential,
        hash: generateHash(credential)
    });

    fs.writeFileSync(
        FILE,
        JSON.stringify(credentials, null, 2)
    );
}

function getCredential(id) {
    if (!fs.existsSync(FILE)) return null;

    const credentials = JSON.parse(
        fs.readFileSync(FILE, "utf8")
    );

    return credentials.find(
        item => item.credential.id === id
    ) || null;
}

function verifyCredential(id) {
    const record = getCredential(id);

    if (!record) return false;

    return generateHash(record.credential) === record.hash;
}

module.exports = {
    createCredential,
    generateHash,
    saveCredential,
    getCredential,
    verifyCredential
};
