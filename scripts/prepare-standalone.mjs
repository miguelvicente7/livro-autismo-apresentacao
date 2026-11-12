import fs from "fs";
import path from "path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
};

if (!fs.existsSync(standaloneDir)) {
  console.error("Standalone output not found. Did next build succeed?");
  process.exit(1);
}

copyDir(staticSrc, staticDest);
copyDir(publicSrc, publicDest);
console.log("Standalone ready: .next/static and public copied.");
