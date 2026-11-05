import { readFileSync } from "node:fs";
const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const ref = process.env.GITHUB_REF_NAME;
if (process.env.GITHUB_REF_TYPE === "tag" && ref !== `v${version}`)
  throw new Error(
    `Le tag ${ref} ne correspond pas à package.json (${version}).`,
  );
const android = readFileSync("android/app/build.gradle", "utf8");
if (!android.includes(`versionName "${version}"`))
  throw new Error("Synchroniser versionName Android avec package.json.");
const web = readFileSync("src/lib/updates.ts", "utf8");
const webVersion = /APP_VERSION\s*=\s*["']([^"']+)["']/.exec(web)?.[1];
if (webVersion !== version)
  throw new Error("Synchroniser APP_VERSION avec package.json.");
console.log(
  `Version ${version} cohérente. Vérifier que versionCode augmente à chaque publication.`,
);
