# 🚀 GIB-RUNS

[![npm version](https://img.shields.io/npm/v/gib-runs.svg)](https://www.npmjs.org/package/gib-runs)
[![npm downloads](https://img.shields.io/npm/dm/gib-runs.svg)](https://www.npmjs.org/package/gib-runs)
[![license](https://img.shields.io/npm/l/gib-runs.svg)](https://github.com/levouinse/gib-runs/blob/main/LICENSE)

A modern development server with live reload and hot module replacement. Built for developers who value capability over connections.

> *"Unlike some people, this actually runs on merit, not nepotism."*

## Why GIB-RUNS?

Named after Indonesia's Vice President Gibran Rakabuming Raka, who got his position through family connections. But unlike certain political figures, this server:

- ✅ Earned its position through real features
- ✅ Works without shortcuts or special treatment
- ✅ Serves everyone equally
- ✅ Transparent and honest about what it does
- ✅ Performance based on actual metrics

*"When your dev server has more integrity than some vice presidents."*

## Features

- 🔄 **Live Reload** - Automatic browser refresh on file changes
- ⚡ **Hot CSS Injection** - Update styles without full page reload
- 🎨 **Beautiful UI** - Modern status indicator with real-time feedback
- 📊 **Performance Monitoring** - Track requests, reloads, and uptime
- 📝 **Comprehensive Logging** - All requests, errors, and file changes with timestamps and file sizes
- 📜 **Request History** - Track last 50 requests via `/history` endpoint
- 🗜️ **Compression** - Built-in gzip compression
- 🔒 **HTTPS/HTTP2** - Secure development with modern protocols
- 🌐 **CORS Support** - Easy cross-origin development
- 🔐 **HTTP Auth** - Protect your development server
- 🎯 **SPA Support** - Perfect for Single Page Applications
- 🔌 **Proxy Support** - Proxy API requests during development
- 📦 **Middleware** - Extend functionality with custom middleware
- 🎭 **Mount Directories** - Serve multiple directories on different routes
- 🚀 **NPM Scripts** - Run npm scripts alongside the server
- 🔄 **PM2 Integration** - Production-ready process management
- 🌍 **Public Tunnels** - Share your dev server with anyone, anywhere
- 📱 **Multi-Device** - Access from any device on your network

### 🆕 New Features

- 🎯 **Interactive CLI** - Inquirer-style setup wizard
- 🔍 **Auto-Detect** - Automatically detect project type (React, Vue, Angular, etc.)
- ⚙️ **Config Generator** - Generate `.gib-runs.json` with one command
- 🎨 **Enhanced Logging** - Color-coded logs with better formatting
- 🔗 **Secure Share Links** - Password-protected share links with expiration
- 📱 **QR Code Sharing** - Share via QR code for mobile access
- 🐳 **Docker Support** - Generate Docker files and docker-compose
- 🔧 **Port Resolver** - Automatic port conflict resolution
- 🏢 **Multi-Project** - Run multiple projects simultaneously
- 🌐 **Remote Collaboration** - Secure team sharing with access control

## Installation

```bash
# Global (recommended)
npm install -g gib-runs

# Local
npm install --save-dev gib-runs
```

## Quick Start

```bash
# Interactive setup (recommended for first time)
gib-runs --init

# Auto-detect project and start
gib-runs --detect
gib-runs

# Serve current directory
gib-runs

# Serve specific directory
gib-runs ./dist

# Custom port
gib-runs --port=3000

# SPA mode
gib-runs --spa

# With HTTPS
gib-runs --https=./config/https.conf.js

# Generate config file
gib-runs --generate-config

# Docker setup
gib-runs --docker-init
```

## Common Use Cases

### Basic Development Server

```bash
# Serve current directory with live reload
gib-runs

# Custom port and verbose logging
gib-runs --port=3000 --verbose

# Serve specific directory
gib-runs ./public
```

### Single Page Applications

```bash
# SPA mode (redirects all routes to index.html)
gib-runs --spa

# SPA with custom port
gib-runs --spa --port=8000
```

### Proxy API Requests

```bash
# Proxy /api to backend server
gib-runs --proxy=/api:http://localhost:3000

# Multiple proxies
gib-runs --proxy=/api:http://localhost:3000 --proxy=/auth:http://localhost:4000
```

### Mount Directories

```bash
# Mount node_modules to /components
gib-runs --mount=/components:./node_modules

# Multiple mounts
gib-runs --mount=/static:./assets --mount=/lib:./node_modules
```

### Run with NPM Scripts

```bash
# Run npm dev script with live reload
gib-runs --npm-script=dev

# Run with PM2 process manager
gib-runs --npm-script=dev --pm2

# Run custom command
gib-runs --exec="node server.js"
```

### Public Tunnels

```bash
# Create public URL (no signup needed)
gib-runs --tunnel

# Use Cloudflare Tunnel
gib-runs --tunnel-service=cloudflared

# Use Ngrok (requires auth token)
gib-runs --tunnel-service=ngrok --tunnel-authtoken=YOUR_TOKEN
```

### HTTPS Development

Create `https.conf.js`:

```javascript
const fs = require('fs');

module.exports = {
  cert: fs.readFileSync(__dirname + '/server.cert'),
  key: fs.readFileSync(__dirname + '/server.key'),
  passphrase: 'your-passphrase'
};
```

Then run:

```bash
gib-runs --https=./https.conf.js
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port=NUMBER` | Port to use | `8080` |
| `--host=ADDRESS` | Address to bind to | `0.0.0.0` |
| `--open=PATH` | Path to open in browser | `/` |
| `--no-browser` | Suppress browser launch | `false` |
| `-q, --quiet` | Suppress logging | `false` |
| `-V, --verbose` | Verbose logging | `false` |
| `--watch=PATH` | Paths to watch (comma-separated) | All files |
| `--ignore=PATH` | Paths to ignore (comma-separated) | None |
| `--no-css-inject` | Reload page on CSS change | `false` |
| `--spa` | Single Page App mode | `false` |
| `--cors` | Enable CORS | `false` |
| `--https=PATH` | HTTPS config module | None |
| `--proxy=ROUTE:URL` | Proxy requests | None |
| `--middleware=PATH` | Custom middleware | None |
| `--htpasswd=PATH` | HTTP auth file | None |
| `--tunnel` | Create public tunnel | `false` |
| `--tunnel-service=NAME` | Tunnel service (lt, cf, ngrok) | `localtunnel` |
| `--npm-script=SCRIPT` | Run npm script | None |
| `--exec=COMMAND` | Run custom command | None |
| `--pm2` | Use PM2 process manager | `false` |
| `--auto-restart` | Auto-restart server on crash | `false` |
| `--enable-upload` | Enable file upload endpoint | `false` |
| `--log-to-file` | Log requests to file | `false` |
| `--init` | Interactive setup wizard | - |
| `--detect` | Auto-detect project type | - |
| `--generate-config` | Generate config file | - |
| `--docker-init` | Generate Docker files | - |
| `--share` | Create secure share link | `false` |
| `--share-password` | Password-protect share link | `false` |
| `--share-expires=MIN` | Share link expiration (minutes) | None |
| `--share-qr` | Show QR code for share link | `false` |

## Node.js API

```javascript
const gibRuns = require('gib-runs');

const server = gibRuns.start({
  port: 8080,
  host: '0.0.0.0',
  root: './public',
  open: true,
  file: 'index.html',
  wait: 100,
  logLevel: 2,
  compression: true,
  cors: true,
  spa: true,
  watch: ['./src', './public'],
  ignore: ['node_modules', '.git'],
  mount: [
    ['/components', './node_modules'],
    ['/assets', './static']
  ],
  proxy: [
    ['/api', 'http://localhost:3000']
  ],
  middleware: [
    function(req, res, next) {
      console.log('Custom middleware');
      next();
    }
  ]
});

// Broadcast custom message to all connected clients
gibRuns.broadcast('reload');

// Shutdown programmatically
// gibRuns.shutdown();
```

## Configuration File

Create `~/.gib-runs.json` for global defaults:

```json
{
  "port": 8080,
  "host": "0.0.0.0",
  "open": true,
  "logLevel": 2,
  "compression": true,
  "cors": false
}
```

Or `.gib-runs.json` in your project root (overrides global config):

```json
{
  "port": 3000,
  "spa": true,
  "watch": ["src", "public"],
  "ignore": ["*.test.js", "*.spec.js"]
}
```

**Priority**: CLI arguments > Project config > Global config > Defaults

## Advanced Features

### Request History

Track all HTTP requests for debugging:

```bash
# View request history
curl http://localhost:8080/history
```

Response:

```json
{
  "total": 10,
  "requests": [
    {
      "timestamp": "2026-02-15T06:09:17.875Z",
      "method": "GET",
      "url": "/index.html",
      "status": 200,
      "duration": "5ms",
      "ip": "127.0.0.1"
    }
  ]
}
```

### Environment Variables

Automatically loads `.env` file from project root:

```bash
# .env
API_KEY=your-secret-key
DATABASE_URL=postgres://localhost/mydb
```

Use in HTML with `${VAR_NAME}` syntax:

```html
<script>
  const apiKey = '${API_KEY}';
</script>
```

### File Upload Endpoint

```bash
# Enable file upload
gib-runs --enable-upload
```

Upload files via POST to `/upload`:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/upload', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log('Uploaded:', data.file));
```

### Health Check Endpoint

Access server health at `/health`:

```bash
curl http://localhost:8080/health
```

Response:

```json
{
  "status": "healthy",
  "uptime": 123.45,
  "server": {
    "requests": 42,
    "reloads": 5,
    "memory": { "rss": "45MB", "heapUsed": "23MB" }
  },
  "system": {
    "platform": "linux",
    "cpus": 8,
    "freemem": "2048MB"
  }
}
```

### Request Logging

```bash
# Log all requests to file
gib-runs --log-to-file

# Logs saved to gib-runs.log
```

Parse logs with jq:

```bash
# Show all 404 errors
cat gib-runs.log | jq 'select(.status == 404)'

# Show slow requests (>100ms)
cat gib-runs.log | jq 'select(.duration | tonumber > 100)'
```

### Custom Middleware

Create `middleware/custom.js`:

```javascript
module.exports = (req, res, next) => {
  console.log('Request:', req.url);
  next();
};
```

Use it:

```bash
gib-runs --middleware=./middleware/custom.js
```

## Network Access

Server automatically binds to `0.0.0.0` and shows all network URLs:

```
🚀 GIB-RUNS v2.5.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 Root:       /home/user/project
  🌐 Local:      http://127.0.0.1:8080
  🔗 Network:    http://192.168.1.100:8080
  🔄 Live Reload: Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Access from any device on your network using the network URLs.

## Tunnel Services

Share your local server with anyone, anywhere:

| Service | Command | Signup Required |
|---------|---------|-----------------|
| **LocalTunnel** | `--tunnel` | ❌ No |
| **Cloudflare** | `--tunnel-service=cloudflared` | ❌ No |
| **Ngrok** | `--tunnel-service=ngrok --tunnel-authtoken=TOKEN` | ✅ Yes |
| **Pinggy** | `--tunnel-service=pinggy` | ❌ No |

Example:

```bash
# Default (LocalTunnel)
gib-runs --tunnel

# Cloudflare (fast and reliable)
gib-runs --tunnel-service=cloudflared
```

## Troubleshooting

### No reload on changes

1. Check browser console for WebSocket connection
2. Ensure files are being watched: `gib-runs --verbose`
3. Try increasing wait time: `gib-runs --wait=500`

### Port already in use

GIB-RUNS will automatically try another port. Or specify one:

```bash
gib-runs --port=3000
```

### ENOSPC error (Linux)

Increase file watchers limit:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**sofinco**
- GitHub: [@levouinse](https://github.com/levouinse)
- Repository: [gib-runs](https://github.com/levouinse/gib-runs)

## Links

- [npm package](https://www.npmjs.com/package/gib-runs)
- [GitHub repository](https://github.com/levouinse/gib-runs)
- [Issue tracker](https://github.com/levouinse/gib-runs/issues)
- [Changelog](https://github.com/levouinse/gib-runs/releases)

---

<p align="center">Made with ❤️ by <a href="https://github.com/levouinse">sofinco</a></p>
