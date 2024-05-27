import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import cp from "node:child_process";

import chalk from "chalk";
import prompts from "prompts";
import validatePackageName from "validate-npm-package-name";

const initScriptDir = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(initScriptDir, "..");
const packageManager = detectPackageManager();

console.log(
  chalk.blue(
    [
      "",
      `Installed dependencies with ${chalk.white(packageManager)}`,
      `Running template init script...`,
      "",
    ].join("\n")
  )
);

const { projectName, gitInit } = await prompts([
  {
    type: "text",
    name: "projectName",
    message: "What would you like to name your project?",
    initial: path.basename(rootDir),
    validate: (name) => {
      const { validForNewPackages, errors } = validatePackageName(name);
      if (!validForNewPackages) {
        return errors.join("\n");
      }
      return true;
    },
  },
  {
    type: fsExists(".git") ? null : "confirm",
    name: "gitInit",
    message: "Would you like to initialize a Git repository?",
    initial: true,
    validate: (name) => {
      const { validForNewPackages, errors } = validatePackageName(name);
      if (!validForNewPackages) {
        return errors.join("\n");
      }
      return true;
    },
  },
]);

// Add project name to package.json
modifyRootPackage((pkg) => {
  pkg.name = projectName;
});

// Replace template instructions in readme with project instructions
fs.writeFileSync(
  "../README.md",
  [
    `# ${projectName}`,
    "",
    `This project was generated from a template.`,
    "",
    `## Setup`,
    "",
    `This project uses \`${packageManager}\` to manage dependencies.`,
    "",
    "```bash",
    `${packageManager} install`,
    "```",
    "",
  ].join("\n"),
  "utf-8"
);

// Clean up the init script
console.log(chalk.blue(`\nCleaning up init script...`));
fs.rmSync(initScriptDir, { recursive: true });
console.log(chalk.blue(`Cleaning up package.json scripts...`));
modifyRootPackage((pkg) => {
  delete pkg.scripts.postinstall;
});

if (gitInit) {
  console.log(chalk.blue(`Initializing Git repository...`));

  const spawnOpts = { cwd: rootDir, stdio: "inherit" };
  cp.spawnSync("git", ["init"], spawnOpts);
  cp.spawnSync("git", ["add", "."], spawnOpts);
  cp.spawnSync("git", ["commit", "-m", "Initial commit"], spawnOpts);
}

console.log(chalk.green(`\n✔ Template init script finished successfully`));

/*
 * Helper functions
 */

function fsExists(file) {
  try {
    fs.accessSync(path.resolve(rootDir, file));
    return true;
  } catch {
    return false;
  }
}

function detectPackageManager() {
  return (
    (fsExists("pnpm-lock.yaml") && "pnpm") ||
    (fsExists("yarn.lock") && "yarn") ||
    (fsExists("bun.lockb") && "bun") ||
    "npm"
  );
}

function modifyRootPackage(updateFn) {
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const updatedPkg = updateFn(pkg);
  fs.writeFileSync(pkgPath, JSON.stringify(updatedPkg ?? pkg, null, 2) + "\n");
}
