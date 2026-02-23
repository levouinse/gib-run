const crypto = require('crypto');
const chalk = require('chalk');

const shareLinks = new Map();
const MAX_SHARE_LINKS = 100; // Prevent memory leak

const generateShareToken = () => {
	return crypto.randomBytes(16).toString('hex');
};

const generatePassword = () => {
	// Use crypto for secure password generation
	const length = 12;
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
	const randomBytes = crypto.randomBytes(length);
	let password = '';
	
	for (let i = 0; i < length; i++) {
		password += chars[randomBytes[i] % chars.length];
	}
	
	return password;
};

const createShareLink = (options = {}) => {
	// Cleanup expired links before creating new one
	cleanupExpiredLinks();
	
	// Prevent memory leak
	if (shareLinks.size >= MAX_SHARE_LINKS) {
		// Remove oldest link
		const firstKey = shareLinks.keys().next().value;
		shareLinks.delete(firstKey);
	}
	
	const token = generateShareToken();
	const password = options.password || (options.secure ? generatePassword() : null);
	const expiresAt = options.expiresIn ? Date.now() + options.expiresIn : null;
	
	const shareData = {
		token,
		password,
		createdAt: Date.now(),
		expiresAt,
		accessCount: 0,
		maxAccess: options.maxAccess || null,
		metadata: options.metadata || {}
	};
	
	shareLinks.set(token, shareData);
	
	return shareData;
};

const validateShareLink = (token, password) => {
	// Input validation
	if (!token || typeof token !== 'string' || token.length !== 32) {
		return { valid: false, reason: 'invalid_token' };
	}
	
	const shareData = shareLinks.get(token);
	
	if (!shareData) {
		return { valid: false, reason: 'invalid_token' };
	}
	
	if (shareData.expiresAt && Date.now() > shareData.expiresAt) {
		shareLinks.delete(token);
		return { valid: false, reason: 'expired' };
	}
	
	if (shareData.maxAccess && shareData.accessCount >= shareData.maxAccess) {
		return { valid: false, reason: 'max_access_reached' };
	}
	
	// Constant-time comparison to prevent timing attacks
	if (shareData.password) {
		if (!password || typeof password !== 'string') {
			return { valid: false, reason: 'invalid_password' };
		}
		
		const hash1 = crypto.createHash('sha256').update(shareData.password).digest();
		const hash2 = crypto.createHash('sha256').update(password).digest();
		
		if (!crypto.timingSafeEqual(hash1, hash2)) {
			return { valid: false, reason: 'invalid_password' };
		}
	}
	
	shareData.accessCount++;
	
	return { valid: true, shareData };
};

const revokeShareLink = (token) => {
	return shareLinks.delete(token);
};

const listShareLinks = () => {
	const links = [];
	const now = Date.now();
	
	shareLinks.forEach((data, token) => {
		const isExpired = data.expiresAt && now > data.expiresAt;
		links.push({
			token,
			password: data.password,
			createdAt: data.createdAt,
			expiresAt: data.expiresAt,
			expired: isExpired,
			accessCount: data.accessCount,
			maxAccess: data.maxAccess
		});
	});
	
	return links;
};

const cleanupExpiredLinks = () => {
	const now = Date.now();
	let cleaned = 0;
	
	shareLinks.forEach((data, token) => {
		if (data.expiresAt && now > data.expiresAt) {
			shareLinks.delete(token);
			cleaned++;
		}
	});
	
	return cleaned;
};

const generateQRCode = (url) => {
	try {
		const qrcode = require('qrcode-terminal');
		return new Promise((resolve) => {
			qrcode.generate(url, { small: true }, (qr) => {
				resolve(qr);
			});
		});
	} catch {
		return null;
	}
};

const displayShareInfo = async (baseUrl, shareData, options = {}) => {
	const shareUrl = `${baseUrl}?share=${shareData.token}`;
	
	console.log(chalk.cyan.bold('\n  🔗 Share Link Created'));
	console.log(chalk.cyan('━'.repeat(60)));
	console.log(chalk.white('  URL:        ') + chalk.green.bold(shareUrl));
	
	if (shareData.password) {
		console.log(chalk.white('  Password:   ') + chalk.yellow.bold(shareData.password));
		console.log(chalk.gray('              (Share this with authorized users)'));
	}
	
	if (shareData.expiresAt) {
		const expiresIn = Math.floor((shareData.expiresAt - Date.now()) / 1000 / 60);
		console.log(chalk.white('  Expires:    ') + chalk.yellow(`${expiresIn} minutes`));
	}
	
	if (shareData.maxAccess) {
		console.log(chalk.white('  Max Access: ') + chalk.yellow(shareData.maxAccess));
	}
	
	if (options.showQR) {
		console.log(chalk.white('\n  📱 QR Code:'));
		const qr = await generateQRCode(shareUrl);
		if (qr) {
			console.log(qr);
		} else {
			console.log(chalk.gray('     Install qrcode-terminal: npm i -g qrcode-terminal'));
		}
	}
	
	console.log(chalk.cyan('━'.repeat(60)) + '\n');
};

const createShareMiddleware = () => {
	return (req, res, next) => {
		const { URL } = require('url');
		const url = new URL(req.url, `http://${req.headers.host}`);
		const shareToken = url.searchParams.get('share');
		
		if (!shareToken) {
			return next();
		}
		
		const password = req.headers['x-share-password'] || url.searchParams.get('password');
		const validation = validateShareLink(shareToken, password);
		
		if (!validation.valid) {
			res.statusCode = 403;
			res.setHeader('Content-Type', 'application/json');
			
			const messages = {
				invalid_token: 'Invalid share link',
				expired: 'Share link has expired',
				max_access_reached: 'Maximum access limit reached',
				invalid_password: 'Invalid password'
			};
			
			res.end(JSON.stringify({
				error: validation.reason,
				message: messages[validation.reason] || 'Access denied'
			}));
			return;
		}
		
		req.shareData = validation.shareData;
		next();
	};
};

module.exports = {
	createShareLink,
	validateShareLink,
	revokeShareLink,
	listShareLinks,
	cleanupExpiredLinks,
	generateQRCode,
	displayShareInfo,
	createShareMiddleware
};
