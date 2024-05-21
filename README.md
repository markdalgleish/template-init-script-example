# template-init-script-example

This is an example of a template repository with a single-use "init" script, contained in the `.init-script` directory.

## Why?

When scaffolding a new project from a template, it's common to want to run a setup script that converts the template into a real project. This script might include its own dependencies and user prompts. For example, you might want to remove the template instructions from the readme, modify files and run Git commands based on user input.

Since this script only needs to run once, we need a way to isolate it from the rest of the project and ensure it cleans up after itself.

## How?

This template features a `postinstall` script which is run automatically after installing dependencies. This script does the following:

- Install dependencies for the `.init-script` directory
- Run `.init-script/index.js`
- Delete the `.init-script` directory
- Remove the `postinstall` script from `package.json` so it doesn't run again

## Try it

You can try out this example template using [degit](https://github.com/Rich-Harris/degit):

```bash
degit markdalgleish/template-init-script-example my-new-project
cd my-new-project
npm install
```

## Credit

This idea is based on the `remix.init` directory supported by [create-remix](https://npmjs.com/package/create-remix) templates.
