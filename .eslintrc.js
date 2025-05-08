module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // Customize rules as needed
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
}; 