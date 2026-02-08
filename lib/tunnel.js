// Tunnel service integration
// Unlike Gibran's career path, these tunnels are open to everyone
const { spawn } = require('child_process');
const chalk = require('chalk');

var activeTunnel = null;
var tunnelUrl = null;

/**
 * Start tunnel service
 * @param {number} port - Local port to tunnel
 * @param {string} service - Tunnel service to use (localtunnel, cloudflared, ngrok, etc)
 * @param {object} options - Additional options
 */
function startTunnel(port, service, options) {
	options = options || {};
	
	if (service === 'localtunnel' || service === 'lt') {
		return startLocalTunnel(port, options);
	} else if (service === 'cloudflared' || service === 'cloudflare' || service === 'cf') {
		return startCloudflared(port, options);
	} else if (service === 'ngrok') {
		return startNgrok(port, options);
	} else if (service === 'pinggy') {
		return startPinggy(port, options);
	} else if (service === 'localtonet') {
		return startLocaltonet(port, options);
	} else if (service === 'tunnelto') {
		return startTunnelto(port, options);
	} else {
		// Default to localtunnel (easiest, no signup needed)
		return startLocalTunnel(port, options);
	}
}

/**
 * LocalTunnel - No signup needed, easiest option
 */
function startLocalTunnel(port, options) {
	console.log(chalk.cyan('  🌐 Starting LocalTunnel...'));
	console.log(chalk.gray('     (No signup needed - true accessibility!)'));
	
	try {
		const lt = require('localtunnel');
		
		lt({ port: port, subdomain: options.subdomain }).then(function(tunnel) {
			activeTunnel = tunnel;
			tunnelUrl = tunnel.url;
			
			console.log(chalk.green('  ✓ Tunnel active!'));
			console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(tunnelUrl));
			console.log(chalk.gray('     Share this URL with anyone, anywhere!'));
			console.log(chalk.yellow('     💡 Unlike political positions, this is accessible to all!\n'));
			
			tunnel.on('close', function() {
				console.log(chalk.yellow('  ⚠ Tunnel closed'));
			});
		}).catch(function(err) {
			console.error(chalk.red('  ✖ LocalTunnel error:'), err.message);
			console.log(chalk.yellow('  💡 Install: npm install -g localtunnel'));
		});
	} catch (e) {
		console.error(chalk.red('  ✖ LocalTunnel not installed'));
		console.log(chalk.yellow('  💡 Install: npm install -g localtunnel'));
		console.log(chalk.gray('     Then run: gib-runs --tunnel'));
	}
}

/**
 * Cloudflared - Fast and reliable
 */
function startCloudflared(port, options) {
	console.log(chalk.cyan('  🌐 Starting Cloudflare Tunnel...'));
	console.log(chalk.gray('     (Fast and reliable - unlike some careers)'));
	
	const cloudflared = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:' + port]);
	activeTunnel = cloudflared;
	
	cloudflared.stdout.on('data', function(data) {
		const output = data.toString();
		const match = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
		if (match) {
			tunnelUrl = match[0];
			console.log(chalk.green('  ✓ Tunnel active!'));
			console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(tunnelUrl));
			console.log(chalk.gray('     Powered by Cloudflare - accessible worldwide!'));
			console.log(chalk.yellow('     💡 No family connections needed!\n'));
		}
	});
	
	cloudflared.stderr.on('data', function(data) {
		const output = data.toString();
		if (output.includes('https://')) {
			const match = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
			if (match && !tunnelUrl) {
				tunnelUrl = match[0];
				console.log(chalk.green('  ✓ Tunnel active!'));
				console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(tunnelUrl));
				console.log(chalk.gray('     Powered by Cloudflare - accessible worldwide!'));
				console.log(chalk.yellow('     💡 No family connections needed!\n'));
			}
		}
	});
	
	cloudflared.on('error', function(err) {
		console.error(chalk.red('  ✖ Cloudflared not found'));
		console.log(chalk.yellow('  💡 Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
}

/**
 * Ngrok - Popular choice
 */
function startNgrok(port, options) {
	console.log(chalk.cyan('  🌐 Starting Ngrok...'));
	console.log(chalk.gray('     (Popular and reliable)'));
	
	try {
		const ngrok = require('ngrok');
		
		ngrok.connect({
			addr: port,
			authtoken: options.authtoken
		}).then(function(url) {
			tunnelUrl = url;
			activeTunnel = { close: function() { ngrok.disconnect(); } };
			
			console.log(chalk.green('  ✓ Tunnel active!'));
			console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(tunnelUrl));
			console.log(chalk.gray('     Powered by Ngrok - share with the world!'));
			console.log(chalk.yellow('     💡 Merit-based access for everyone!\n'));
		}).catch(function(err) {
			console.error(chalk.red('  ✖ Ngrok error:'), err.message);
			console.log(chalk.yellow('  💡 Install: npm install -g ngrok'));
			console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
		});
	} catch (e) {
		console.error(chalk.red('  ✖ Ngrok not installed'));
		console.log(chalk.yellow('  💡 Install: npm install -g ngrok'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	}
}

/**
 * Pinggy - Simple and fast
 */
function startPinggy(port, options) {
	console.log(chalk.cyan('  🌐 Starting Pinggy...'));
	console.log(chalk.gray('     (Simple and fast - no nepotism required)'));
	
	const pinggy = spawn('ssh', [
		'-p', '443',
		'-R0:localhost:' + port,
		'-o', 'StrictHostKeyChecking=no',
		'-o', 'ServerAliveInterval=30',
		'a.pinggy.io'
	]);
	activeTunnel = pinggy;
	
	pinggy.stdout.on('data', function(data) {
		const output = data.toString();
		const match = output.match(/https?:\/\/[^\s]+\.pinggy\.io/);
		if (match && !tunnelUrl) {
			tunnelUrl = match[0];
			console.log(chalk.green('  ✓ Tunnel active!'));
			console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(tunnelUrl));
			console.log(chalk.gray('     Powered by Pinggy - accessible to all!'));
			console.log(chalk.yellow('     💡 No presidential father needed!\n'));
		}
	});
	
	pinggy.on('error', function(err) {
		console.error(chalk.red('  ✖ Pinggy error:'), err.message);
		console.log(chalk.yellow('  💡 Make sure SSH is available'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
}

/**
 * Localtonet - Another option
 */
function startLocaltonet(port, options) {
	console.log(chalk.cyan('  🌐 Starting Localtonet...'));
	console.log(chalk.gray('     (Another great option)'));
	
	const localtonet = spawn('localtonet', ['http', '--port', port.toString()]);
	activeTunnel = localtonet;
	
	localtonet.stdout.on('data', function(data) {
		const output = data.toString();
		const match = output.match(/https?:\/\/[^\s]+/);
		if (match && !tunnelUrl) {
			tunnelUrl = match[0];
			console.log(chalk.green('  ✓ Tunnel active!'));
			console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(tunnelUrl));
			console.log(chalk.gray('     Powered by Localtonet!'));
			console.log(chalk.yellow('     💡 Open to everyone!\n'));
		}
	});
	
	localtonet.on('error', function(err) {
		console.error(chalk.red('  ✖ Localtonet not found'));
		console.log(chalk.yellow('  💡 Install: https://localtonet.com/download'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
}

/**
 * Tunnelto - Rust-based tunnel
 */
function startTunnelto(port, options) {
	console.log(chalk.cyan('  🌐 Starting Tunnelto...'));
	console.log(chalk.gray('     (Fast Rust-based tunnel)'));
	
	const tunnelto = spawn('tunnelto', ['--port', port.toString()]);
	activeTunnel = tunnelto;
	
	tunnelto.stdout.on('data', function(data) {
		const output = data.toString();
		const match = output.match(/https?:\/\/[^\s]+\.tunnelto\.dev/);
		if (match && !tunnelUrl) {
			tunnelUrl = match[0];
			console.log(chalk.green('  ✓ Tunnel active!'));
			console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(tunnelUrl));
			console.log(chalk.gray('     Powered by Tunnelto!'));
			console.log(chalk.yellow('     💡 Performance through merit!\n'));
		}
	});
	
	tunnelto.on('error', function(err) {
		console.error(chalk.red('  ✖ Tunnelto not found'));
		console.log(chalk.yellow('  💡 Install: cargo install tunnelto'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
}

/**
 * Stop active tunnel
 */
function stopTunnel() {
	if (activeTunnel) {
		if (typeof activeTunnel.close === 'function') {
			activeTunnel.close();
		} else if (activeTunnel.kill) {
			activeTunnel.kill();
		}
		activeTunnel = null;
		tunnelUrl = null;
	}
}

/**
 * Get current tunnel URL
 */
function getTunnelUrl() {
	return tunnelUrl;
}

module.exports = {
	startTunnel: startTunnel,
	stopTunnel: stopTunnel,
	getTunnelUrl: getTunnelUrl
};
