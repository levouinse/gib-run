const js = require('@eslint/js');

module.exports = [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'commonjs',
			globals: {
				console: 'readonly',
				process: 'readonly',
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				Buffer: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				setImmediate: 'readonly',
				clearImmediate: 'readonly'
			}
		},
		rules: {
			'quotes': 0,
			'curly': 0,
			'strict': 0,
			'no-process-exit': 0,
			'eqeqeq': 1,
			'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
			'no-shadow': 0,
			'no-undef': 2,
			'no-redeclare': 2,
			'no-constant-condition': 1
		},
		ignores: [
			'node_modules/**',
			'test/**',
			'coverage/**',
			'dist/**',
			'build/**'
		]
	}
];
