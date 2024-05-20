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

console.log(chalk.blue(`\nRunning the template's "init" script...\n`));

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
  ].join("\n"),
  "utf-8"
);

// Clean up the init script
await fs.rm(initScriptDir, { recursive: true });
updateRootPackage((pkg) => {
  delete pkg.scripts.preinstall;
});

console.log(chalk.green(`\n✔ Template's "init" script finished successfully`));
