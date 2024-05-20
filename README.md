# template-init-script-example

This is an example of a template repository with a single-use "init" script in the `.init-script` directory.

The `preinstall` script in this template will do the following:

- Install the dependencies for the `.init-script` directory.
- Run `.init-script/index.js`.
- Delete the `.init-script` directory.
- Remove the `preinstall` script from `package.json` so it doesn't run again.

You can see this template in action using [degit](https://github.com/Rich-Harris/degit):

```bash
degit markdalgleish/template-init-script-example my-new-project
cd my-new-project
npm install
```
