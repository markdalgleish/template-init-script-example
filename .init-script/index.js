import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import chalk from "chalk";
import prompts from "prompts";
import validatePackageName from "validate-npm-package-name";

const initScriptDir = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(initScriptDir, "..");

async function updateRootPackage(updateFn) {
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  const updatedPkg = updateFn(pkg);
  await fs.writeFile(
    pkgPath,
    JSON.stringify(updatedPkg ?? pkg, null, 2) + "\n"
  );
}

async function detectPackageManager() {
  const detect = (name, file) =>
    fs
      .access(path.join(rootDir, file))
      .then(() => name)
      .catch(() => null);

  return (
    (await detect("pnpm", "pnpm-lock.yaml")) ??
    (await detect("yarn", "yarn.lock")) ??
    (await detect("bun", "bun.lockb")) ??
    "npm"
  );
}

const packageManager = await detectPackageManager();

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

const { projectName } = await prompts({
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
});

// Update project name in package.json
updateRootPackage((pkg) => {
  pkg.name = projectName;
});

// Update readme so it's no longer a template
await fs.writeFile(
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
await fs.rm(initScriptDir, { recursive: true });
updateRootPackage((pkg) => {
  delete pkg.scripts.postinstall;
});

console.log(chalk.green(`\n✔ Template init script finished successfully`));
