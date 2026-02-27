/**
 * Shared utility functions for GIB-RUNS
 * Eliminates code duplication across modules
 */

/**
 * Get ISO timestamp
 * @returns {string} ISO 8601 timestamp
 */
const getTimestamp = () => new Date().toISOString();

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe string
 * @returns {string} Escaped string
 */
const escapeHtml = (unsafe) => {
	if (typeof unsafe !== 'string') return '';
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

/**
 * Sanitize file path to prevent traversal attacks
 * @param {string} filePath - File path to sanitize
 * @returns {string} Sanitized path
 */
const sanitizePath = (filePath) => {
	const path = require('path');
	return path.normalize(filePath).replace(/^(\.\.[\\/])+/, '');
};

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @returns {string} Formatted string
 */
const formatBytes = (bytes) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format duration in milliseconds
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted duration
 */
const formatDuration = (ms) => {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
	return `${(ms / 60000).toFixed(2)}m`;
};

/**
 * Create LRU cache with max size
 * @param {number} maxSize - Maximum cache size
 * @returns {Map} LRU cache
 */
const createLRUCache = (maxSize = 100) => {
	const cache = new Map();
	
	return {
		get(key) {
			if (!cache.has(key)) return undefined;
			const value = cache.get(key);
			// Move to end (most recently used)
			cache.delete(key);
			cache.set(key, value);
			return value;
		},
		set(key, value) {
			if (cache.has(key)) {
				cache.delete(key);
			} else if (cache.size >= maxSize) {
				// Remove oldest (first) entry
				const firstKey = cache.keys().next().value;
				cache.delete(firstKey);
			}
			cache.set(key, value);
		},
		has(key) {
			return cache.has(key);
		},
		delete(key) {
			return cache.delete(key);
		},
		clear() {
			cache.clear();
		},
		get size() {
			return cache.size;
		}
	};
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
const debounce = (func, wait) => {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

/**
 * Validate port number
 * @param {number} port - Port number
 * @returns {boolean} Valid or not
 */
const isValidPort = (port) => {
	return Number.isInteger(port) && port >= 0 && port <= 65535;
};

/**
 * Validate host
 * @param {string} host - Host string
 * @returns {boolean} Valid or not
 */
const isValidHost = (host) => {
	if (typeof host !== 'string') return false;
	// Simple validation for IP or hostname
	return /^[a-zA-Z0-9.-]+$/.test(host) || host === '0.0.0.0' || host === 'localhost';
};

/**
 * Safe JSON parse
 * @param {string} str - JSON string
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed object or default
 */
const safeJsonParse = (str, defaultValue = null) => {
	try {
		return JSON.parse(str);
	} catch {
		return defaultValue;
	}
};

/**
 * Limit string length
 * @param {string} str - String to limit
 * @param {number} maxLength - Max length
 * @returns {string} Limited string
 */
const limitString = (str, maxLength = 100) => {
	if (typeof str !== 'string') return '';
	return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

/**
 * Create periodic cleanup timer
 * @param {Function} cleanupFn - Cleanup function
 * @param {number} interval - Interval in ms
 * @returns {NodeJS.Timeout} Timer
 */
const createCleanupTimer = (cleanupFn, interval = 60000) => {
	const timer = setInterval(cleanupFn, interval);
	if (timer.unref) timer.unref();
	return timer;
};

module.exports = {
	getTimestamp,
	escapeHtml,
	sanitizePath,
	formatBytes,
	formatDuration,
	createLRUCache,
	debounce,
	isValidPort,
	isValidHost,
	safeJsonParse,
	limitString,
	createCleanupTimer
};
