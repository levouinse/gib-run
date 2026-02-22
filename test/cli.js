var assert = require('assert');
var path = require('path');
var spawn = require('child_process').spawn;
var cmd = path.join(__dirname, "..", "gib-run.js");

function exec_test(args, callback) {
	var stdout = '';
	var stderr = '';
	var child;
	
	if (process.platform === 'win32') {
		child = spawn(process.execPath, [cmd].concat(args));
	} else {
		child = spawn(cmd, args);
	}
	
	child.stdout.on('data', function(data) {
		stdout += data.toString();
	});
	
	child.stderr.on('data', function(data) {
		stderr += data.toString();
	});
	
	// Kill process after 500ms to speed up tests
	var killTimer = setTimeout(function() {
		child.kill('SIGTERM');
		setTimeout(function() {
			if (!child.killed) {
				child.kill('SIGKILL');
			}
		}, 100);
	}, 500);
	
	child.on('close', function(code) {
		clearTimeout(killTimer);
		callback(code !== 0 && code !== null ? new Error('Exit code: ' + code) : null, stdout, stderr);
	});
	
	child.on('error', function(err) {
		clearTimeout(killTimer);
		callback(err, stdout, stderr);
	});
}

describe('command line usage', function() {
	it('--version', function(done) {
		exec_test([ "--version" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("gib-runs") >= 0, "version not found");
			done();
		});
	});
	it('--help', function(done) {
		exec_test([ "--help" ], function(error, stdout, stdin) {
			assert(!error, error);
			assert(stdout.indexOf("GIB-RUNS") >= 0 || stdout.indexOf("Usage") >= 0, "usage not found");
			done();
		});
	});
	it('--quiet', function(done) {
		this.timeout(1000);
		exec_test([ "--quiet", "--no-browser", "--test" ], function(error, stdout, stderr) {
			// In quiet mode, stdout should be minimal or empty
			assert(stdout.length < 100, "stdout not quiet: " + stdout.length + " bytes");
			done();
		});
	});
	it('--port', function(done) {
		this.timeout(1000);
		exec_test([ "--port=16123", "--no-browser", "--test" ], function(error, stdout, stderr) {
			assert(stdout.indexOf("16123") !== -1, "port string not found");
			done();
		});
	});
	it('--host', function(done) {
		this.timeout(1000);
		exec_test([ "--host=localhost", "--no-browser", "--test" ], function(error, stdout, stdin) {
			assert(stdout.indexOf("localhost") !== -1 || stdout.indexOf("127.0.0.1") !== -1, "host string not found");
			done();
		});
	});
	it('--htpasswd', function(done) {
		this.timeout(1000);
		exec_test(
			[ "--htpasswd=" + path.join(__dirname, "data/htpasswd-test"),
				"--no-browser",
				"--test"
			], function(error, stdout, stdin) {
			assert(stdout.indexOf("GIB-RUNS") >= 0 || stdout.indexOf("Local") >= 0, "server string not found");
			done();
		});
	});
});
