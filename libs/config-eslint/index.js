require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: [require.resolve('gts/.eslintrc.json')],
  plugins: ['perfectionist'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'perfectionist/sort-imports': [
      'error',
      {
        type: 'line-length',
        order: 'asc',
      },
    ],
  },
};
