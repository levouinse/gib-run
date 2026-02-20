const { spawn } = require('child_process');
const chalk = require('chalk');
const https = require('https');

let activeTunnel = null;
let tunnelUrl = null;
let tunnelPassword = null;

const getTunnelPassword = (callback) => {
	https.get('https://loca.lt/mytunnelpassword', (res) => {
		let data = '';
		res.on('data', (chunk) => { data += chunk; });
		res.on('end', () => {
			tunnelPassword = data.trim();
			if (callback) callback(tunnelPassword);
		});
	}).on('error', () => {
		console.log(chalk.yellow('  ⚠ Could not fetch tunnel password'));
		if (callback) callback(null);
	});
};

const displayTunnelInfo = (url, service) => {
	console.log(chalk.green('  ✓ Tunnel active!'));
	console.log(chalk.magenta('  🌍 Public URL: ') + chalk.green.bold(url));
	
	if (service === 'localtunnel' || service === 'lt') {
		if (tunnelPassword) {
			console.log(chalk.cyan('  🔑 Tunnel Password: ') + chalk.yellow.bold(tunnelPassword));
			console.log(chalk.gray('     (Share this with visitors to access your site)'));
		}
		console.log(chalk.cyan('  🚀 Bypass Options:'));
		console.log(chalk.gray('     • Set header: ') + chalk.white('bypass-tunnel-reminder: any-value'));
		console.log(chalk.gray('     • Or use custom User-Agent header'));
	}
	
	console.log(chalk.gray('     Share this URL with anyone, anywhere!'));
	console.log(chalk.yellow('     💡 Unlike political positions, this is accessible to all!\n'));
};

const startLocalTunnel = (port, options) => {
	console.log(chalk.cyan('  🌐 Starting LocalTunnel...'));
	console.log(chalk.gray('     (No signup needed - true accessibility!)'));
	
	getTunnelPassword(() => {
		try {
			const lt = require('localtunnel');
			
			const ltOptions = { 
				port,
				allow_invalid_cert: true,
				...(options.subdomain && { subdomain: options.subdomain })
			};
			
			lt(ltOptions).then((tunnel) => {
				activeTunnel = tunnel;
				tunnelUrl = tunnel.url;
				
				displayTunnelInfo(tunnelUrl, 'localtunnel');
				
				tunnel.on('close', () => {
					console.log(chalk.yellow('  ⚠ Tunnel closed'));
					activeTunnel = null;
					tunnelUrl = null;
				});
				
				tunnel.on('error', (err) => {
					console.error(chalk.red('  ✖ Tunnel connection error:'), err.message);
					console.log(chalk.yellow('  ⚠ Server continues running locally'));
					console.log(chalk.gray('  💡 Tunnel may be unstable, try alternative services:'));
					console.log(chalk.gray('     • gib-runs --tunnel-service=cloudflared'));
					console.log(chalk.gray('     • gib-runs --tunnel-service=ngrok --tunnel-authtoken=YOUR_TOKEN'));
					console.log(chalk.gray('     • Or continue using local network URLs\n'));
					
					activeTunnel = null;
					tunnelUrl = null;
				});
			}).catch((err) => {
				console.error(chalk.red('  ✖ LocalTunnel failed to start:'), err.message);
				console.log(chalk.yellow('  ⚠ Server continues running locally'));
				console.log(chalk.gray('  💡 Possible solutions:'));
				console.log(chalk.gray('     • Check your internet connection'));
				console.log(chalk.gray('     • Try again later (localtunnel.me may be down)'));
				console.log(chalk.gray('     • Use alternative: gib-runs --tunnel-service=cloudflared'));
				console.log(chalk.gray('     • Or use local network URLs for now\n'));
			});
		} catch (e) {
			console.error(chalk.red('  ✖ LocalTunnel not installed'));
			console.log(chalk.yellow('  💡 Install: npm install -g localtunnel'));
			console.log(chalk.gray('     Then run: gib-runs --tunnel'));
			console.log(chalk.gray('     Server continues running locally\n'));
		}
	});
};

const startCloudflared = (port) => {
	console.log(chalk.cyan('  🌐 Starting Cloudflare Tunnel...'));
	console.log(chalk.gray('     (Fast and reliable - unlike some careers)'));
	
	const cloudflared = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`]);
	activeTunnel = cloudflared;
	
	const handleOutput = (data) => {
		const output = data.toString();
		const match = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
		if (match && !tunnelUrl) {
			tunnelUrl = match[0];
			displayTunnelInfo(tunnelUrl, 'cloudflared');
		}
	};
	
	cloudflared.stdout.on('data', handleOutput);
	cloudflared.stderr.on('data', handleOutput);
	
	cloudflared.on('error', () => {
		console.error(chalk.red('  ✖ Cloudflared not found'));
		console.log(chalk.yellow('  💡 Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
};

const startNgrok = (port, options) => {
	console.log(chalk.cyan('  🌐 Starting Ngrok...'));
	console.log(chalk.gray('     (Popular and reliable)'));
	
	try {
		const ngrok = require('ngrok');
		
		ngrok.connect({
			addr: port,
			authtoken: options.authtoken
		}).then((url) => {
			tunnelUrl = url;
			activeTunnel = { close: () => ngrok.disconnect() };
			displayTunnelInfo(tunnelUrl, 'ngrok');
		}).catch((err) => {
			console.error(chalk.red('  ✖ Ngrok error:'), err.message);
			console.log(chalk.yellow('  💡 Install: npm install -g ngrok'));
			console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
		});
	} catch (e) {
		console.error(chalk.red('  ✖ Ngrok not installed'));
		console.log(chalk.yellow('  💡 Install: npm install -g ngrok'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	}
};

const startPinggy = (port) => {
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
	
	pinggy.stdout.on('data', (data) => {
		const output = data.toString();
		const match = output.match(/https?:\/\/[^\s]+\.pinggy\.io/);
		if (match && !tunnelUrl) {
			tunnelUrl = match[0];
			displayTunnelInfo(tunnelUrl, 'pinggy');
		}
	});
	
	pinggy.on('error', (err) => {
		console.error(chalk.red('  ✖ Pinggy error:'), err.message);
		console.log(chalk.yellow('  💡 Make sure SSH is available'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
};

const startLocaltonet = (port) => {
	console.log(chalk.cyan('  🌐 Starting Localtonet...'));
	console.log(chalk.gray('     (Another great option)'));
	
	const localtonet = spawn('localtonet', ['http', '--port', port.toString()]);
	activeTunnel = localtonet;
	
	localtonet.stdout.on('data', (data) => {
		const output = data.toString();
		const match = output.match(/https?:\/\/[^\s]+/);
		if (match && !tunnelUrl) {
			tunnelUrl = match[0];
			displayTunnelInfo(tunnelUrl, 'localtonet');
		}
	});
	
	localtonet.on('error', () => {
		console.error(chalk.red('  ✖ Localtonet not found'));
		console.log(chalk.yellow('  💡 Install: https://localtonet.com/download'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
};

const startTunnelto = (port) => {
	console.log(chalk.cyan('  🌐 Starting Tunnelto...'));
	console.log(chalk.gray('     (Fast Rust-based tunnel)'));
	
	const tunnelto = spawn('tunnelto', ['--port', port.toString()]);
	activeTunnel = tunnelto;
	
	tunnelto.stdout.on('data', (data) => {
		const output = data.toString();
		const match = output.match(/https?:\/\/[^\s]+\.tunnelto\.dev/);
		if (match && !tunnelUrl) {
			tunnelUrl = match[0];
			displayTunnelInfo(tunnelUrl, 'tunnelto');
		}
	});
	
	tunnelto.on('error', () => {
		console.error(chalk.red('  ✖ Tunnelto not found'));
		console.log(chalk.yellow('  💡 Install: cargo install tunnelto'));
		console.log(chalk.gray('     Or use: gib-runs --tunnel (uses localtunnel by default)'));
	});
};

const startTunnel = (port, service, options = {}) => {
	const tunnelServices = {
		localtunnel: startLocalTunnel,
		lt: startLocalTunnel,
		cloudflared: startCloudflared,
		cloudflare: startCloudflared,
		cf: startCloudflared,
		ngrok: startNgrok,
		pinggy: startPinggy,
		localtonet: startLocaltonet,
		tunnelto: startTunnelto
	};
	
	const tunnelFn = tunnelServices[service] || startLocalTunnel;
	return tunnelFn(port, options);
};

const stopTunnel = () => {
	if (activeTunnel) {
		if (typeof activeTunnel.close === 'function') {
			activeTunnel.close();
		} else if (activeTunnel.kill) {
			activeTunnel.kill();
		}
		activeTunnel = null;
		tunnelUrl = null;
	}
};

const getTunnelUrl = () => tunnelUrl;
const getPassword = () => tunnelPassword;

module.exports = {
	startTunnel,
	stopTunnel,
	getTunnelUrl,
	getPassword
};
