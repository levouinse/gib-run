# GIB-RUNS Plugin Development Guide

## Plugin API

A gib-runs plugin is a JavaScript module that exports an object with lifecycle hooks.

### Basic Plugin Structure

```javascript
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My awesome plugin',
  
  // Lifecycle hooks
  onInit(server) {
    // Called when server is created
    // Add middleware, configure routes
  },
  
  async onStart(address) {
    // Called when server starts listening
    // address: { address, port, family }
  },
  
  async onRequest(req, res, next) {
    // Called for each HTTP request
    // Behaves like Express middleware
    next();
  },
  
  async onFileChange(filePath, changeType) {
    // Called when watched file changes
    // changeType: 'change' | 'add' | 'unlink'
  },
  
  async onReload() {
    // Called before browser reload
  },
  
  async onStop() {
    // Called when server stops
    // Cleanup resources
  }
};
```

### Plugin Context

Inside hooks, `this` refers to the plugin instance with:
- `this.server` - Server instance
- `this.options` - Plugin options from config

### Example: Custom Header Plugin

```javascript
// plugins/custom-headers.js
module.exports = {
  name: 'custom-headers',
  version: '1.0.0',
  
  onRequest(req, res, next) {
    const headers = this.options.headers || {};
    
    Object.keys(headers).forEach(key => {
      res.setHeader(key, headers[key]);
    });
    
    next();
  }
};
```

Usage:
```json
{
  "plugins": [
    ["./plugins/custom-headers.js", {
      "headers": {
        "X-Custom": "value",
        "X-Powered-By": "gib-runs"
      }
    }]
  ]
}
```

### Example: API Mock Plugin

```javascript
// plugins/api-mock.js
module.exports = {
  name: 'api-mock',
  version: '1.0.0',
  
  onInit(server) {
    const mocks = this.options.mocks || {};
    
    Object.keys(mocks).forEach(route => {
      server.use(route, (req, res, next) => {
        if (req.url === route) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(mocks[route]));
        } else {
          next();
        }
      });
    });
  }
};
```

Usage:
```json
{
  "plugins": [
    ["./plugins/api-mock.js", {
      "mocks": {
        "/api/user": { "id": 1, "name": "John" },
        "/api/posts": [{ "id": 1, "title": "Hello" }]
      }
    }]
  ]
}
```

### Example: Performance Monitor Plugin

```javascript
// plugins/perf-monitor.js
const chalk = require('chalk');

module.exports = {
  name: 'perf-monitor',
  version: '1.0.0',
  
  onRequest(req, res, next) {
    const start = Date.now();
    const originalEnd = res.end;
    
    res.end = function(...args) {
      const duration = Date.now() - start;
      const threshold = this.options.threshold || 100;
      
      if (duration > threshold) {
        console.log(chalk.yellow(`⚠ Slow request: ${req.url} (${duration}ms)`));
      }
      
      originalEnd.apply(res, args);
    }.bind(this);
    
    next();
  }
};
```

### Publishing Plugins

1. Create npm package:
```bash
mkdir gib-runs-plugin-myplugin
cd gib-runs-plugin-myplugin
npm init -y
```

2. Add plugin code:
```javascript
// index.js
module.exports = {
  name: 'myplugin',
  version: '1.0.0',
  // ... hooks
};
```

3. Publish:
```bash
npm publish
```

4. Use in projects:
```json
{
  "plugins": ["gib-runs-plugin-myplugin"]
}
```

### Built-in Plugins

These plugins are included in gib-runs core:

- `compression` - Gzip compression
- `cors` - CORS support
- `spa` - SPA fallback
- `proxy` - API proxying
- `auth` - HTTP Basic Auth
- `tunnel` - Public tunnels
- `health` - Health endpoint
- `upload` - File upload
- `history` - Request history

### Plugin Best Practices

1. **Error Handling**: Always wrap async code in try-catch
2. **Cleanup**: Use `onStop` to cleanup resources
3. **Performance**: Avoid blocking operations in `onRequest`
4. **Configuration**: Validate options in `onInit`
5. **Logging**: Use `server.logger` for consistent output

### Server API

Available on `this.server`:

```javascript
// Add middleware
server.use(middleware)

// Get config
server.config.port
server.config.root

// Get stats
server.getStats()

// Broadcast to WebSocket clients
server.broadcast('reload')

// Logger
server.logger.info('message')
server.logger.error('error')
```

### Event Bus

Listen to server events:

```javascript
const { eventBus, Events } = require('gib-runs/core/event-bus');

eventBus.on(Events.FILE_CHANGE, (path) => {
  console.log('File changed:', path);
});
```

Available events:
- `server:start`
- `server:stop`
- `file:change`
- `file:add`
- `file:unlink`
- `reload:trigger`
- `reload:css`

### Testing Plugins

```javascript
// test/plugin.test.js
const gibRuns = require('gib-runs');
const myPlugin = require('../plugins/my-plugin');

const server = gibRuns.start({
  port: 0,
  plugins: [myPlugin]
});

// Test your plugin
```

## Community Plugins

Share your plugins:
1. Tag with `gib-runs-plugin` on npm
2. Add to [awesome-gib-runs](https://github.com/levouinse/awesome-gib-runs)
3. Submit PR to plugin directory

## Support

- [GitHub Issues](https://github.com/levouinse/gib-runs/issues)
- [Discussions](https://github.com/levouinse/gib-runs/discussions)
