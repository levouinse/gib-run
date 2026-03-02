const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// MIME type validation mapping
const ALLOWED_MIME_TYPES = {
	'.jpg': ['image/jpeg'],
	'.jpeg': ['image/jpeg'],
	'.png': ['image/png'],
	'.gif': ['image/gif'],
	'.pdf': ['application/pdf'],
	'.txt': ['text/plain'],
	'.zip': ['application/zip', 'application/x-zip-compressed']
};

module.exports = {
	name: 'upload',
	version: '1.0.0',
	description: 'File upload endpoint at /upload',
	
	onInit(server) {
		const enabled = server.config.enableUpload === true;
		
		if (!enabled) return;
		
		const uploadDir = server.config.uploadDir || './uploads';
		const maxSize = server.config.uploadMaxSize || 10 * 1024 * 1024; // 10MB default
		const allowedExts = server.config.uploadAllowedExts || [
			'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.zip'
		];
		
		const storage = multer.diskStorage({
			destination: uploadDir,
			filename: (req, file, cb) => {
				// Use crypto for secure random filename
				const randomName = crypto.randomBytes(16).toString('hex');
				const ext = path.extname(file.originalname).toLowerCase();
				cb(null, randomName + ext);
			}
		});
		
		const fileFilter = (req, file, cb) => {
			const ext = path.extname(file.originalname).toLowerCase();
			
			if (!allowedExts.includes(ext)) {
				return cb(new Error(`File type ${ext} not allowed`), false);
			}
			
			// Validate MIME type matches extension
			const allowedMimes = ALLOWED_MIME_TYPES[ext];
			if (allowedMimes && !allowedMimes.includes(file.mimetype)) {
				return cb(new Error(`MIME type ${file.mimetype} doesn't match extension ${ext}`), false);
			}
			
			cb(null, true);
		};
		
		const upload = multer({ 
			storage,
			fileFilter,
			limits: { fileSize: maxSize }
		});
		
		server.use('/upload', (req, res, next) => {
			if (req.method !== 'POST') {
				return next();
			}
			
			upload.single('file')(req, res, (err) => {
				if (err) {
					res.statusCode = 400;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ 
						error: err.message,
						success: false
					}));
					return;
				}
				
				if (!req.file) {
					res.statusCode = 400;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ 
						error: 'No file uploaded',
						success: false
					}));
					return;
				}
				
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({
					success: true,
					filename: req.file.filename,
					size: req.file.size,
					mimetype: req.file.mimetype
				}));
			});
		});
	}
};
