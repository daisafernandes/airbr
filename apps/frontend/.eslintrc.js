/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    '@airbr/eslint-config',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react', 'react-hooks'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: __dirname + '/tsconfig.json',
      },
    },
  },
  rules: {
    'react/prop-types': 'off',
  },
}
