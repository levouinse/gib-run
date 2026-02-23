# Migration Guide: v2.x → v3.0

## What Changed?

GIB-RUNS v3.0 introduces a **plugin system** for better extensibility and maintainability.

### Core Features (Always Included)

✅ Static file server
✅ Live reload
✅ Hot CSS injection
✅ File watcher
✅ WebSocket
✅ Compression (can disable)
✅ CORS (can disable)
✅ SPA fallback (can disable)

### Built-in Plugins (Included, Auto-loaded)

These plugins are included in the package but only activate when configured:

- `compression` - Gzip compression
- `cors` - CORS support
- `spa` - SPA fallback
- `proxy` - API proxying
- `auth` - HTTP Basic Auth
- `tunnel` - Public tunnels
- `health` - Health endpoint
- `upload` - File upload
- `history` - Request history

### Removed from Core

❌ PM2 integration → Use PM2 directly: `pm2 start "gib-runs"`
❌ NPM script runner → Use concurrently: `concurrently "npm run dev" "gib-runs"`
❌ Docker helper → Use Docker documentation
❌ Interactive CLI → Simplified to minimal prompts
❌ Project detector → Not needed for core functionality
❌ Share manager → Will be available as external plugin

## Migration Steps

### 1. Update Package

```bash
npm install gib-runs@3.0.0
```

### 2. Update Config

**v2.x config:**
```json
{
  "port": 8080,
  "spa": true,
  "cors": true,
  "tunnel": true,
  "enableUpload": true
}
```

**v3.0 config (same, no changes needed):**
```json
{
  "port": 8080,
  "spa": true,
  "cors": true,
  "tunnel": true,
  "enableUpload": true
}
```

Built-in plugins auto-activate based on config flags.

### 3. CLI Changes

Most CLI flags work the same:

```bash
# v2.x
gib-runs --spa --cors --tunnel

# v3.0 (same)
gib-runs --spa --cors --tunnel
```

### 4. Removed Features

**PM2 Integration:**
```bash
# v2.x
gib-runs --npm-script=dev --pm2

# v3.0 - Use PM2 directly
pm2 start "gib-runs" --name my-app
```

**NPM Script Runner:**
```bash
# v2.x
gib-runs --npm-script=dev

# v3.0 - Use concurrently
npm install -D concurrently
# package.json
{
  "scripts": {
    "dev": "concurrently \"npm run build:watch\" \"gib-runs dist\""
  }
}
```

**Interactive Setup:**
```bash
# v2.x
gib-runs --init

# v3.0 - Manual config or use defaults
gib-runs --generate-config
```

### 5. Custom Plugins

If you used custom middleware:

**v2.x:**
```bash
gib-runs --middleware=./my-middleware.js
```

**v3.0 - Convert to plugin:**
```javascript
// my-plugin.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  
  onRequest(req, res, next) {
    // Your middleware logic
    next();
  }
};
```

```json
{
  "plugins": ["./my-plugin.js"]
}
```

## API Changes

### Node.js API

**v2.x:**
```javascript
const gibRuns = require('gib-runs');

gibRuns.start({
  port: 8080,
  spa: true,
  middleware: [myMiddleware]
});
```

**v3.0:**
```javascript
const gibRuns = require('gib-runs');

gibRuns.start({
  port: 8080,
  spa: true,
  plugins: [myPlugin]
});
```

### Plugin API

New in v3.0:

```javascript
const server = gibRuns.start({ port: 8080 });

// Register plugin programmatically
server.pluginManager.register({
  name: 'my-plugin',
  onRequest(req, res, next) {
    // ...
    next();
  }
});
```

## Benefits of v3.0

1. **Smaller Core**: ~30% smaller bundle size
2. **Better Performance**: Optimized watcher and caching
3. **Extensible**: Build your own plugins
4. **Maintainable**: Cleaner codebase
5. **Stable**: Better error handling

## Breaking Changes Summary

| Feature | v2.x | v3.0 |
|---------|------|------|
| Core size | 2.5MB | 1.7MB |
| PM2 integration | ✅ Built-in | ❌ Use PM2 CLI |
| NPM runner | ✅ Built-in | ❌ Use concurrently |
| Docker helper | ✅ Built-in | ❌ Use Docker docs |
| Interactive CLI | ✅ Full wizard | ⚠️ Minimal |
| Project detector | ✅ Auto-detect | ❌ Removed |
| Share manager | ✅ Built-in | 🔌 External plugin |
| Plugin system | ❌ None | ✅ Full support |
| Custom middleware | ✅ Via flag | ✅ Via plugins |

## Need Help?

- [Plugin Guide](./PLUGIN_GUIDE.md)
- [GitHub Issues](https://github.com/levouinse/gib-runs/issues)
- [Discussions](https://github.com/levouinse/gib-runs/discussions)

## Rollback to v2.x

If you need v2.x features:

```bash
npm install gib-runs@2.5.0
```

v2.x will receive security updates until 2027-02-23.
