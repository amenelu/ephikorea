const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
require("dotenv").config();

const root = path.resolve(__dirname, "..");
const databasePath = path.resolve(
  root,
  process.env.SQLITE_PATH || "data/ephikorea.sqlite",
);
const uploadPath = path.join(root, "public", "uploads", "products");
const backupRoot = path.join(root, "backups");

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function copyDirectoryIfExists(source, destination) {
  if (!fs.existsSync(source)) {
    fs.mkdirSync(destination, { recursive: true });
    return 0;
  }

  fs.cpSync(source, destination, { recursive: true });
  return fs
    .readdirSync(destination, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile()).length;
}

async function main() {
  if (!fs.existsSync(databasePath)) {
    throw new Error(`SQLite database was not found: ${databasePath}`);
  }

  const backupDirectory = path.join(backupRoot, timestamp());
  const backupDatabasePath = path.join(backupDirectory, "ephikorea.sqlite");
  const backupUploadsPath = path.join(backupDirectory, "uploads", "products");

  fs.mkdirSync(backupDirectory, { recursive: true });

  const db = new Database(databasePath, { readonly: true });
  await db.backup(backupDatabasePath);
  db.close();

  const uploadedFileCount = copyDirectoryIfExists(uploadPath, backupUploadsPath);
  const manifest = {
    createdAt: new Date().toISOString(),
    databasePath,
    uploadedFileCount,
  };

  fs.writeFileSync(
    path.join(backupDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`Backup created: ${backupDirectory}`);
  console.log(`Uploaded product files copied: ${uploadedFileCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
