import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
	// JavaScript recommended rules
	js.configs.recommended,

	// Prettier integration
	prettier,

	// Custom rules for Node
	{
		languageOptions: {
			globals: { ...globals.node },
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		rules: {
			'no-undef': 'off',
			'no-console': 'warn',
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'consistent-return': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			eqeqeq: ['error', 'always'],
		},
	},

	// files override
	{
		files: ['**/*.test.js', '**/__tests__/**/*.js', 'views/**/*.hbs'],
		languageOptions: { globals: { ...globals.node, jest: true } },
		rules: {
			'no-unused-expressions': 'off',
		},
	},
]
