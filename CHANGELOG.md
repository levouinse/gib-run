# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2026-02-08

### Added
- 🔑 **Tunnel Password Display** - Automatically fetch and display LocalTunnel password
  - Password is your public IP address
  - Automatically fetched from `https://loca.lt/mytunnelpassword`
  - Displayed in console when tunnel starts
  - Share with visitors to access your site
- 🚀 **Bypass Instructions** - Clear instructions for bypassing LocalTunnel password page
  - Set header: `bypass-tunnel-reminder: any-value`
  - Or use custom User-Agent header
  - Perfect for API/webhook requests
- 📋 **Enhanced Tunnel Info** - Better tunnel information display
  - Shows password for LocalTunnel
  - Shows bypass options
  - Consistent display across all tunnel services

### Improved
- Better error handling for tunnel password fetch
- More informative tunnel startup messages
- Updated README with detailed tunnel password documentation

## [2.1.0] - 2026-02-08

### Added - Major Features
- 🌍 **Public Tunnels** - Share dev server with anyone, anywhere
  - LocalTunnel (default, no signup needed)
  - Cloudflare Tunnel support (`--tunnel-service=cloudflared`)
  - Ngrok support (`--tunnel-service=ngrok`)
  - Pinggy support (`--tunnel-service=pinggy`)
  - Localtonet support (`--tunnel-service=localtonet`)
  - Tunnelto support (`--tunnel-service=tunnelto`)
- 🚀 **NPM Scripts Integration** - Run npm dev, start, or any script alongside server
  - `--npm-script=dev` - Run npm dev
  - `--npm-script=start` - Run npm start
  - Process output with [npm] prefix
  - PID tracking and management
- ⚙️ **Custom Command Execution** - Execute any command with live reload
  - `--exec="command"` - Run any command
  - Process output with [cmd] prefix
  - Full stdout/stderr capture
- 🔄 **PM2 Integration** - Production-ready process management
  - `--pm2` - Use PM2 process manager
  - `--pm2-name=app-name` - Custom app name
  - Works with npm scripts and custom commands
- 📝 **Enhanced Logging** - Verbose mode with detailed information
  - Request/response logging with timestamps
  - Middleware loading logs
  - Process output capture
  - Error stack traces in verbose mode

### Dependencies
- Added `localtunnel@^2.0.2` for tunnel support

## [2.0.0] - 2026-02-08

### Fixed
- **CRITICAL**: Network access now actually works - server properly binds to 0.0.0.0 and is accessible from external devices
- Network URLs are always displayed automatically (no need for verbose mode)
- Fixed --host CLI option to display correct host in output
- Improved network interface detection (filters out internal/loopback addresses)

### Added
- 🎨 Beautiful modern UI with status indicator in browser
- 📊 Performance monitoring middleware (`--performance`) - tracks slow requests
- 🛡️ Security headers middleware (`--security`) - production-ready security headers
- 🚦 Rate limiting middleware (`--rate-limit=N`) - protect against abuse
- 📱 QR code option (`--qr`, `--qrcode`) for mobile access
- 🌍 **Public Tunnels** - Share dev server with anyone, anywhere
  - LocalTunnel (default, no signup needed)
  - Cloudflare Tunnel support
  - Ngrok support
  - Pinggy support
  - Localtonet support
  - Tunnelto support
- 🚀 **NPM Scripts Integration** - Run npm dev, start, or any script alongside server
- ⚙️ **Custom Command Execution** - Execute any command with live reload
- 🔄 **PM2 Integration** - Production-ready process management
- 📊 Performance monitoring (request count, reload count, uptime)
- 🗜️ Built-in gzip compression for better performance
- 🎪 Auto-reconnection with exponential backoff
- 🎨 Colored console output with chalk
- 📈 Statistics display on server shutdown
- ⚡ Hot CSS injection without full page reload
- 🔄 Smart file watching with timestamps
- 🚀 Modern startup banner with satirical quotes about Gibran
- 📱 Better multi-device support display
- 🎯 Enhanced SPA support
- 🔌 Improved proxy configuration
- 📦 Better middleware support
- 😏 Enhanced satirical commentary about nepotism vs merit throughout
- 📝 **Enhanced Logging** - Verbose mode with detailed request/response logging

### Changed
- Renamed from `live-server` to `gib-runs`
- Updated all dependencies to latest versions
- Modernized codebase with better error handling
- Improved logging with icons and colors
- Enhanced WebSocket connection handling
- Better file change detection messages
- Modernized CLI help and version display
- Improved startup banner with satire quote: "Unlike Gibran, this actually works through merit"
- Enhanced help text with new options and satire
- Better documentation in README.md with more Gibran jokes

### Improved
- Performance optimizations
- Better error messages
- More informative console output with helpful tips
- Enhanced developer experience
- Improved documentation
- Network URLs prominently displayed with "Access from other devices" label

### Technical
- Upgraded chokidar to v3.5.3
- Replaced colors with chalk v4.1.2
- Updated connect to v3.7.0
- Added compression middleware
- Added performance monitoring middleware
- Added security headers middleware
- Added rate limiting middleware
- Modernized all dependencies
- Better Node.js compatibility (>=16.0.0)
- All 32 tests passing
- Zero ESLint warnings or errors
- Fully backward compatible

---

## Previous Versions

This project is a complete modernization and rebranding of live-server with significant enhancements and new features.
