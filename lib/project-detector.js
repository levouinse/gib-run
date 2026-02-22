const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const detectFramework = (cwd) => {
	const packagePath = path.join(cwd, 'package.json');
	
	if (!fs.existsSync(packagePath)) {
		return { type: 'static', framework: null };
	}
	
	try {
		const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
		const deps = { ...pkg.dependencies, ...pkg.devDependencies };
		
		// React
		if (deps.react) {
			if (deps.next) return { type: 'spa', framework: 'next', buildDir: '.next', port: 3000 };
			if (deps['react-scripts']) return { type: 'spa', framework: 'create-react-app', buildDir: 'build', port: 3000 };
			if (deps.vite) return { type: 'spa', framework: 'vite-react', buildDir: 'dist', port: 5173 };
			return { type: 'spa', framework: 'react', buildDir: 'build', port: 3000 };
		}
		
		// Vue
		if (deps.vue) {
			if (deps.nuxt) return { type: 'spa', framework: 'nuxt', buildDir: '.nuxt', port: 3000 };
			if (deps['@vue/cli-service']) return { type: 'spa', framework: 'vue-cli', buildDir: 'dist', port: 8080 };
			if (deps.vite) return { type: 'spa', framework: 'vite-vue', buildDir: 'dist', port: 5173 };
			return { type: 'spa', framework: 'vue', buildDir: 'dist', port: 8080 };
		}
		
		// Angular
		if (deps['@angular/core']) {
			return { type: 'spa', framework: 'angular', buildDir: 'dist', port: 4200 };
		}
		
		// Svelte
		if (deps.svelte) {
			if (deps['@sveltejs/kit']) return { type: 'spa', framework: 'sveltekit', buildDir: 'build', port: 5173 };
			return { type: 'spa', framework: 'svelte', buildDir: 'public', port: 5000 };
		}
		
		// Vite (generic)
		if (deps.vite) {
			return { type: 'spa', framework: 'vite', buildDir: 'dist', port: 5173 };
		}
		
		// Express/Node
		if (deps.express || deps.koa || deps.fastify) {
			return { type: 'backend', framework: 'node', buildDir: null, port: 3000 };
		}
		
		return { type: 'static', framework: null };
	} catch {
		return { type: 'static', framework: null };
	}
};

const detectBuildDir = (cwd) => {
	const commonDirs = ['dist', 'build', 'public', 'out', '.next', '.nuxt', 'www'];
	
	for (const dir of commonDirs) {
		const fullPath = path.join(cwd, dir);
		if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
			return dir;
		}
	}
	
	return null;
};

const suggestConfig = (cwd) => {
	const detection = detectFramework(cwd);
	const buildDir = detectBuildDir(cwd) || detection.buildDir;
	
	const config = {
		port: detection.port || 8080,
		spa: detection.type === 'spa',
		root: buildDir || '.',
		framework: detection.framework
	};
	
	// Framework-specific recommendations
	if (detection.framework === 'next' || detection.framework === 'nuxt') {
		config.npmScript = 'dev';
		config.note = 'Use --npm-script=dev for development mode';
	} else if (detection.framework && (detection.framework === 'vite' || detection.framework.includes('vite-'))) {
		config.npmScript = 'dev';
		config.note = 'Vite detected - consider using native vite dev server';
	} else if (detection.type === 'spa') {
		config.spa = true;
		config.note = 'SPA mode enabled for client-side routing';
	}
	
	return config;
};

const displayDetection = (cwd) => {
	const detection = detectFramework(cwd);
	const suggestion = suggestConfig(cwd);
	
	console.log(chalk.cyan.bold('\n  🔍 Project Detection'));
	console.log(chalk.cyan('━'.repeat(60)));
	
	if (detection.framework) {
		console.log(chalk.white('  Framework:  ') + chalk.green(detection.framework));
		console.log(chalk.white('  Type:       ') + chalk.yellow(detection.type));
		if (suggestion.root !== '.') {
			console.log(chalk.white('  Build Dir:  ') + chalk.yellow(suggestion.root));
		}
		console.log(chalk.white('  Suggested:  ') + chalk.cyan(`--port=${suggestion.port}`) + 
			(suggestion.spa ? chalk.cyan(' --spa') : ''));
		
		if (suggestion.note) {
			console.log(chalk.gray('\n  💡 ' + suggestion.note));
		}
	} else {
		console.log(chalk.gray('  No framework detected - serving as static files'));
	}
	
	console.log(chalk.cyan('━'.repeat(60)) + '\n');
	
	return suggestion;
};

module.exports = {
	detectFramework,
	detectBuildDir,
	suggestConfig,
	displayDetection
};
