#!/usr/bin/env node

// Test script untuk memverifikasi tunnel password
const https = require('https');
const chalk = require('chalk');

console.log(chalk.cyan('🧪 Testing Tunnel Password Fetch...\n'));

https.get('https://loca.lt/mytunnelpassword', function(res) {
	var data = '';
	
	res.on('data', function(chunk) {
		data += chunk;
	});
	
	res.on('end', function() {
		const password = data.trim();
		
		console.log(chalk.green('✓ Successfully fetched tunnel password!'));
		console.log(chalk.cyan('🔑 Tunnel Password: ') + chalk.yellow.bold(password));
		console.log(chalk.gray('\nThis is your public IP address.'));
		console.log(chalk.gray('Share this with visitors to access your LocalTunnel.\n'));
		
		// Validate IP format
		const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
		if (ipRegex.test(password)) {
			console.log(chalk.green('✓ Password format is valid (IPv4 address)'));
		} else {
			console.log(chalk.yellow('⚠ Password format is unusual (might be IPv6 or proxy)'));
		}
		
		console.log(chalk.cyan('\n📋 Bypass Options:'));
		console.log(chalk.gray('  • Set header: ') + chalk.white('bypass-tunnel-reminder: any-value'));
		console.log(chalk.gray('  • Or use custom User-Agent header'));
		console.log(chalk.gray('\n💡 Test complete!\n'));
	});
}).on('error', function(err) {
	console.error(chalk.red('✖ Error fetching tunnel password:'), err.message);
	console.log(chalk.yellow('\n💡 Make sure you have internet connection.'));
	console.log(chalk.gray('   The password is fetched from: https://loca.lt/mytunnelpassword\n'));
	process.exit(1);
});
