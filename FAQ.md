# Frequently Asked Questions (FAQ)

## General Questions

### What is GIB-RUNS?

GIB-RUNS is a modern development server with live reload, hot module replacement, and advanced features. It's designed for developers who value capability over connections.

### Why the name "GIB-RUNS"?

Named after Indonesia's Vice President Gibran Rakabuming Raka, who got his position through family connections. But unlike certain political figures, this server:
- ✅ Earned its position through real features
- ✅ Works without shortcuts or special treatment
- ✅ Serves everyone equally
- ✅ Transparent and honest about what it does

### How is it different from live-server?

See our [detailed comparison](COMPARISON.md). Key differences:
- Hot CSS injection (no full reload)
- Built-in proxy support
- Public tunnels
- Secure share links
- Docker support
- Interactive setup
- Auto-detection
- And 20+ more features

## Installation & Setup

### How do I install GIB-RUNS?

```bash
# Global installation (recommended)
npm install -g gib-runs

# Local installation
npm install --save-dev gib-runs
```

### Do I need a configuration file?

No! GIB-RUNS works out of the box:

```bash
gib-runs
```

But you can create one for convenience:

```bash
gib-runs --generate-config
```

### What config file formats are supported?

- `gib.config.js` (recommended)
- `gib.config.json`
- `.gib-runs.json`
- `.gibrc.json`
- `.gibrc.js`

### How do I use the interactive setup?

```bash
gib-runs --init
```

This will guide you through all options and save your preferences.

## Usage Questions

### How do I serve a specific directory?

```bash
gib-runs ./dist
```

### How do I change the port?

```bash
gib-runs --port=3000
```

Or in config:

```javascript
export default {
  port: 3000
}
```

### How do I enable SPA mode?

```bash
gib-runs --spa
```

This redirects all routes to `index.html` for client-side routing.

### How do I proxy API requests?

```bash
gib-runs --proxy=/api:http://localhost:3000
```

Or in config:

```javascript
export default {
  proxy: {
    '/api': 'http://localhost:3000',
    '/auth': 'http://localhost:4000'
  }
}
```

### How do I enable CORS?

```bash
gib-runs --cors
```

### How do I use HTTPS?

Create `https.conf.js`:

```javascript
const fs = require('fs');

module.exports = {
  cert: fs.readFileSync('./server.cert'),
  key: fs.readFileSync('./server.key')
};
```

Then:

```bash
gib-runs --https=./https.conf.js
```

### How do I run npm scripts?

```bash
gib-runs --npm-script=dev
```

This runs `npm run dev` with live reload support.

## Troubleshooting

### Port already in use

GIB-RUNS automatically finds the next available port. You'll see:

```
⚠ Port 8080 is already in use
🔍 Searching for available port...
✓ Found available port: 8081
```

### No reload on file changes

1. Check browser console for WebSocket connection
2. Ensure files are being watched:
   ```bash
   gib-runs --verbose
   ```
3. Try increasing wait time:
   ```bash
   gib-runs --wait=500
   ```

### ENOSPC error (Linux)

This means you've hit the file watcher limit. Fix:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

Or ignore large directories:

```bash
gib-runs --ignore=node_modules,dist
```

### CSS not hot-reloading

Make sure you're not using `--no-css-inject`:

```bash
gib-runs  # CSS will hot-reload by default
```

### Tunnel not working

Try alternative services:

```bash
# Cloudflare (fast and reliable)
gib-runs --tunnel-service=cloudflared

# Ngrok (requires token)
gib-runs --tunnel-service=ngrok --tunnel-authtoken=YOUR_TOKEN
```

### Permission denied errors

On Linux/macOS, you might need to adjust permissions:

```bash
chmod +r <file>
```

For ports below 1024, you need elevated privileges:

```bash
sudo gib-runs --port=80
```

But we recommend using ports >= 1024.

## Advanced Features

### How do I create a share link?

```bash
# Basic share link
gib-runs --share

# With password
gib-runs --share --share-password

# With expiration (30 minutes)
gib-runs --share --share-expires=30

# With QR code
gib-runs --share --share-qr
```

### How do I use Docker?

Generate Docker files:

```bash
gib-runs --docker-init
```

Then:

```bash
docker-compose up
```

### How do I add custom middleware?

Create `middleware.js`:

```javascript
module.exports = (req, res, next) => {
  console.log('Request:', req.url);
  next();
};
```

Use it:

```bash
gib-runs --middleware=./middleware.js
```

Or in config:

```javascript
export default {
  middleware: [
    './middleware.js',
    'security',
    'performance'
  ]
}
```

### How do I use hooks?

In `gib.config.js`:

```javascript
export default {
  hooks: {
    beforeRequest(req, res, next) {
      console.log('Before:', req.url);
      next();
    },
    
    afterResponse(req, res) {
      console.log('After:', req.url);
    },
    
    onFileChange(path) {
      console.log('Changed:', path);
    }
  }
}
```

### How do I enable file uploads?

```bash
gib-runs --enable-upload
```

Upload via POST to `/upload`:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/upload', {
  method: 'POST',
  body: formData
});
```

### How do I check server health?

Access `/health` endpoint:

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
    "reloads": 5
  }
}
```

### How do I view request history?

Access `/history` endpoint:

```bash
curl http://localhost:8080/history
```

## Performance

### How do I enable compression?

It's enabled by default! Disable with:

```javascript
export default {
  compression: false
}
```

### How do I reduce memory usage?

1. Ignore unnecessary directories:
   ```bash
   gib-runs --ignore=node_modules,dist,coverage
   ```

2. Lower log level:
   ```bash
   gib-runs --quiet
   ```

3. Disable features you don't need:
   ```javascript
   export default {
     compression: false,
     enableHealth: false,
     logToFile: false
   }
   ```

### How do I improve startup time?

1. Use config file instead of CLI args
2. Ignore large directories
3. Use `--quiet` mode

## Integration

### How do I use with React?

```bash
# Development
gib-runs --npm-script=start

# Production
npm run build
gib-runs build --spa
```

### How do I use with Vue?

```bash
# Development
gib-runs --npm-script=serve

# Production
npm run build
gib-runs dist --spa
```

### How do I use with Next.js?

```bash
# Development
gib-runs --npm-script=dev

# Production
npm run build
gib-runs .next --spa
```

### How do I use with Vite?

```bash
# Development
gib-runs --npm-script=dev

# Production
npm run build
gib-runs dist --spa
```

### How do I use with Angular?

```bash
# Development
gib-runs --npm-script=start

# Production
npm run build
gib-runs dist --spa
```

### How do I use with PM2?

```bash
gib-runs --npm-script=dev --pm2 --pm2-name=my-app
```

Manage with PM2:

```bash
pm2 logs my-app
pm2 restart my-app
pm2 stop my-app
pm2 delete my-app
```

## Security

### How do I add HTTP authentication?

Create `.htpasswd` file:

```bash
htpasswd -c .htpasswd username
```

Use it:

```bash
gib-runs --htpasswd=./.htpasswd
```

### How do I enable security headers?

```bash
gib-runs --security
```

This adds:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security (HTTPS only)

### How do I rate limit requests?

```bash
gib-runs --rate-limit=100
```

This limits to 100 requests per minute per IP.

### Are share links secure?

Yes! Share links support:
- Password protection
- Expiration time
- Access count limits
- Token-based authentication

```bash
gib-runs --share --share-password --share-expires=60
```

## Contributing

### How do I report bugs?

Open an issue on [GitHub](https://github.com/levouinse/gib-runs/issues) with:
- GIB-RUNS version (`gib-runs --version`)
- Node.js version (`node --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior

### How do I request features?

Open a feature request on [GitHub](https://github.com/levouinse/gib-runs/issues) with:
- Clear description of the feature
- Use case / why it's needed
- Example usage (if applicable)

### How do I contribute code?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

### What license is GIB-RUNS under?

MIT License - free to use, modify, and distribute.

### Can I use it commercially?

Yes! The MIT license allows commercial use.

### Do I need to credit GIB-RUNS?

Not required, but appreciated! ⭐

---

## Still have questions?

- 📖 Read the [full documentation](README.md)
- 💡 Check [examples](EXAMPLES.md)
- 🔍 Search [existing issues](https://github.com/levouinse/gib-runs/issues)
- 💬 Ask on [GitHub Discussions](https://github.com/levouinse/gib-runs/discussions)
- 🐛 Report bugs on [GitHub Issues](https://github.com/levouinse/gib-runs/issues)
