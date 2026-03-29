/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@airbr/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
