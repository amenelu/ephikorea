const fs = require("fs");
const path = require("path");
require("dotenv").config();

const root = path.resolve(__dirname, "..");
const databasePath = path.resolve(
  root,
  process.env.SQLITE_PATH || "data/ephikorea.sqlite",
);
const uploadPath = path.join(root, "public", "uploads", "products");

function usage() {
  console.error("Usage: npm run restore:data -- <backup-directory>");
}

function removeSqliteSidecars(targetPath) {
  for (const suffix of ["-wal", "-shm"]) {
    const sidecarPath = `${targetPath}${suffix}`;
    if (fs.existsSync(sidecarPath)) {
      fs.rmSync(sidecarPath, { force: true });
    }
  }
}

function main() {
  const backupDirectory = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : "";

  if (!backupDirectory) {
    usage();
    process.exit(1);
  }

  const backupDatabasePath = path.join(backupDirectory, "ephikorea.sqlite");
  const backupUploadsPath = path.join(backupDirectory, "uploads", "products");

  if (!fs.existsSync(backupDatabasePath)) {
    throw new Error(`Backup database was not found: ${backupDatabasePath}`);
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  removeSqliteSidecars(databasePath);
  fs.copyFileSync(backupDatabasePath, databasePath);

  fs.rmSync(uploadPath, { recursive: true, force: true });
  fs.mkdirSync(uploadPath, { recursive: true });

  if (fs.existsSync(backupUploadsPath)) {
    fs.cpSync(backupUploadsPath, uploadPath, { recursive: true });
  }

  console.log(`Database restored to: ${databasePath}`);
  console.log(`Uploads restored to: ${uploadPath}`);
  console.log("Restart the app after restoring production data.");
}

main();
