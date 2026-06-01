require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: [require.resolve('gts/.eslintrc.json')],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
