import fs from "node:fs";

const folder = new URL("../data/", import.meta.url);
const file = new URL("signed-credentials.json", folder);

export function saveSignedCredential(credential, signature) {
  fs.mkdirSync(folder, { recursive: true });

  let records = [];
  if (fs.existsSync(file)) {
    records = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  records.push({ credential, signature });
  fs.writeFileSync(file, JSON.stringify(records, null, 2));
}

export function getSignedCredential(id) {
  if (!fs.existsSync(file)) return null;

  const records = JSON.parse(fs.readFileSync(file, "utf8"));
  return records.find(record => record.credential.id === id) || null;
}
