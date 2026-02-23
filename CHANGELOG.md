# Changelog

All notable changes to this project will be documented in this file.

## [3.0.0-beta.1] - 2026-02-23

### 🎉 MAJOR RELEASE: Plugin System

GIB-RUNS v3.0 introduces a complete plugin architecture for better extensibility and maintainability.

### Added - Plugin System
- 🔌 **Plugin Manager** - Core plugin infrastructure
  - Lifecycle hooks: `onInit`, `onStart`, `onRequest`, `onFileChange`, `onReload`, `onStop`
  - Plugin registration and management
  - Event-based communication
  - Error isolation per plugin
- 📦 **Built-in Plugins** - Core features as plugins
  - `compression` - Gzip compression
  - `cors` - CORS support
  - `spa` - SPA fallback
  - `proxy` - API proxying
  - `auth` - HTTP Basic Auth
  - `tunnel` - Public tunnels
  - `health` - Health endpoint
  - `upload` - File upload
  - `history` - Request history
- 📚 **Plugin API Documentation** - Complete guide for plugin development
- 🔧 **Plugin Configuration** - Load plugins via config or CLI

### Changed - Architecture
- ♻️ **Refactored Core** - Cleaner, more maintainable codebase
- 📉 **Reduced Bundle Size** - 30% smaller (2.5MB → 1.7MB)
- ⚡ **Performance Improvements** - Optimized watcher and caching
- 🛡️ **Better Error Handling** - Graceful degradation per plugin

### Removed - Deprecated Features
- ❌ **PM2 Integration** - Use PM2 CLI directly
- ❌ **NPM Script Runner** - Use `concurrently` or similar tools
- ❌ **Docker Helper** - Use Docker documentation
- ❌ **Interactive CLI Wizard** - Simplified to minimal prompts
- ❌ **Project Detector** - Not core functionality
- ❌ **Share Manager** - Will be available as external plugin

### Migration
- 📖 **Migration Guide** - Complete guide for upgrading from v2.x
- ⚠️ **Breaking Changes** - See MIGRATION.md for details
- 🔄 **Backward Compatibility** - Most configs work without changes
- 🛠️ **Plugin Conversion** - Guide for converting middleware to plugins

### Documentation
- 📚 **PLUGIN_GUIDE.md** - Complete plugin development guide
- 📖 **MIGRATION.md** - v2.x to v3.0 migration guide
- 🔧 **Updated README** - New plugin system documentation

### Technical Improvements
- 🏗️ **Modular Architecture** - Clear separation of concerns
- 🧪 **Better Testability** - Isolated plugin testing
- 🔍 **Memory Profiling** - Better resource tracking
- 📊 **Performance Monitoring** - Built-in metrics

### Positioning
- 🎯 **Clear Identity** - "Plugin-based dev server for any stack"
- 🚀 **Differentiation** - Framework-agnostic alternative to Vite
- 🌱 **Sustainability** - Community-driven plugin ecosystem
- ⭐ **Growth Path** - Designed for 1k+ GitHub stars

---

## [2.5.0] - 2026-02-22

### Added - Modular Architecture
- 🏗️ **Modular Codebase** - Refactored into clean, maintainable modules
  - `lib/config-manager.js` - Centralized configuration management
  - `lib/project-detector.js` - Auto-detect project frameworks
  - `lib/port-resolver.js` - Automatic port conflict resolution
  - `lib/share-manager.js` - Secure share links with auth
  - `lib/logger.js` - Enhanced logging with colors and formatting
  - `lib/docker-helper.js` - Docker file generation
  - `lib/interactive-cli.js` - Interactive setup wizard

### Added - Interactive CLI
- 🎯 **Interactive Setup Wizard** - `--init` flag
  - Inquirer-style prompts for easy configuration
  - Step-by-step setup for all options
  - Auto-saves to `.gib-runs.json`
  - Perfect for first-time users

### Added - Auto-Detection
- 🔍 **Project Type Detection** - `--detect` flag
  - Automatically detects React, Vue, Angular, Svelte
  - Identifies Next.js, Nuxt, Vite, CRA, Vue CLI
  - Suggests optimal configuration
  - Shows framework-specific recommendations
- ⚙️ **Config Generator** - `--generate-config` flag
  - Generates `.gib-runs.json` based on detection
  - Framework-specific defaults
  - One command setup

### Added - Remote Collaboration
- 🔗 **Secure Share Links** - `--share` flag
  - Password-protected share links
  - Expiration control (minutes)
  - Access count limits
  - Metadata tracking
- 📱 **QR Code Sharing** - `--share-qr` flag
  - Generate QR codes for mobile access
  - Works with share links and network URLs
  - Perfect for multi-device testing
- 🔐 **Share Authentication** - `--share-password` flag
  - Auto-generated secure passwords
  - Custom password support
  - Token-based access control
- ⏰ **Share Expiration** - `--share-expires=MIN` flag
  - Time-limited access (minutes)
  - Automatic cleanup of expired links
  - Perfect for temporary previews

### Added - Docker Support
- 🐳 **Docker File Generator** - `--docker-init` flag
  - Generates optimized Dockerfile
  - Creates docker-compose.yml
  - Includes .dockerignore
  - Health checks included
  - Hot reload support in containers
- 🔧 **Docker-Ready Mode**
  - Detects Docker environment
  - Optimized settings for containers
  - Network-friendly defaults

### Added - Port Management
- 🔧 **Port Conflict Resolver**
  - Automatically finds available ports
  - Graceful fallback on conflicts
  - Multi-project workspace support
  - Clear user notifications

### Improved - Logging & UX
- 🎨 **Enhanced Logging System**
  - Color-coded log levels
  - Better formatting and readability
  - Request logging with colors
  - File change notifications with icons
  - Progress bars and tables
- 📊 **Better TUI**
  - Improved startup banner
  - Clearer status messages
  - Better error formatting
  - Network URL display

### Documentation
- 📚 **New EXAMPLES.md** - Comprehensive usage examples
  - Interactive setup examples
  - Framework-specific guides
  - Docker workflows
  - Remote collaboration patterns
  - Multi-project setups
- 📖 **Updated README.md** - New features documented
  - All new CLI flags
  - Quick start guide updated
  - Feature list expanded

### Changed
- 🔄 **Config Loading** - Now uses config-manager module
  - Cleaner code organization
  - Better error handling
  - Consistent config merging
- 🎯 **Project Detection** - Integrated into startup
  - Auto-suggests SPA mode for detected frameworks
  - Shows framework hints in logs
  - Better user guidance

## [2.4.0] - 2026-02-15

### Added
- 📜 **Request History Tracking** - New `/history` endpoint
  - Tracks last 50 HTTP requests with full details
  - Includes timestamp, method, URL, status, duration, and IP
  - Perfect for debugging and monitoring
- 📊 **Detailed File Change Notifications** - Enhanced file watching
  - Shows file size on changes: `File changed: app.js (12.45KB)`
  - Separate notifications for file add/delete events
  - ➕ File added (logLevel >= 2)
  - ➖ File deleted (logLevel >= 2)
- 📝 **Comprehensive Logging** - Complete request and error logging
  - All requests logged with timestamp and IP address
  - Consistent ISO 8601 timestamps across all logs
  - Works in static, npm-script, and exec modes

### Changed
- 🔧 **Improved Error Handling** - Better error messages with timestamps
  - Server errors include timestamp and stack trace
  - Process errors in npm/exec mode properly logged
  - Watcher errors show detailed information
- ⚡ **Enhanced Process Runner** - Better npm-script and exec mode
  - Stderr properly captured and logged with timestamps
  - Exit codes and signals logged with context
  - Cleaner output formatting

## [2.3.8] - 2026-02-15

### Changed
- 🔧 **Code Refactoring** - Complete codebase cleanup and optimization
  - Removed excessive comments for cleaner code
  - Simplified middleware logic with early returns
  - Improved code readability and maintainability
  - Streamlined error handling across all modules
  - More natural, human-like code structure
- 📝 **Documentation** - Updated README for better clarity
  - More concise and easier to read
  - Maintained unique branding and personality
  - Better organized examples and usage guides

## [2.3.7] - 2026-02-13

### Added
- 📁 **Project-Level Config File** - Support for `.gib-runs.json` in project root
  - Overrides global config (`~/.gib-runs.json`)
  - Priority: Project config > Global config > CLI args > Defaults
  - Perfect for team-shared project settings
- 🎯 **Improved Watch Ignore Patterns** - Better file watching performance
  - Auto-ignore common directories: `node_modules`, `.git`, `dist`, `build`, `coverage`, `.next`, `.nuxt`, `.output`, `out`, `target`
  - Prevents unnecessary reloads from build artifacts
  - Reduces CPU usage during development
- ⚡ **Enhanced File Watching Stability** - More reliable change detection
  - Added `awaitWriteFinish` option to prevent partial file reads
  - Ignores permission errors automatically
  - Debounced file changes for better performance

## [2.3.6] - 2026-02-12

### Added
- 🔄 **Environment Variable Replacement** - Automatic replacement of `${VAR_NAME}` patterns in HTML files
  - Reads from `.env` file automatically
  - Works with all environment variables (APP_NAME, API_KEY, etc)
  - No configuration needed

## [2.3.4] - 2026-02-12

### Added - New Features 🎉
- 🔁 **Auto-Restart on Crash** - Server automatically restarts on unexpected errors
  - Use `--auto-restart` flag to enable
  - Attempts up to 5 restarts before giving up
  - Resilient mode for production-like development
  - Displays restart attempt count in console
- 📤 **File Upload Endpoint** - Built-in file upload support for development
  - Use `--enable-upload` flag to enable
  - POST files to `/upload` endpoint
  - 10MB file size limit
  - Files saved to `./uploads` directory
  - Returns JSON response with file details
- 💚 **Health Check Endpoint** - Monitor server health and statistics
  - Enabled by default (use `--no-health` to disable)
  - Access via `GET /health` or `GET /_health`
  - Returns JSON with uptime, memory usage, request count, reload count
  - System information (CPU, memory, platform)
  - Perfect for monitoring and debugging
- 📝 **Request Logging to File** - Log all requests to file for debugging
  - Use `--log-to-file` flag to enable
  - Logs saved to `gib-runs.log` in project root
  - JSON format with timestamp, method, URL, IP, user-agent, status, duration
  - Automatic log rotation at 10MB
  - Old logs backed up with timestamp
- 🎨 **Custom Error Pages** - Beautiful, informative error pages
  - Enabled by default (use `--no-error-page` to disable)
  - Modern gradient design with detailed error information
  - Shows error stack trace in development mode
  - Covers all HTTP error codes (400, 401, 403, 404, 500, etc)
  - Responsive design for mobile devices
- 🌍 **Environment Variable Support** - Automatic .env file loading
  - Automatically loads `.env` file from project root
  - Uses dotenv package
  - No configuration needed, just create `.env` file
  - Perfect for API keys, database URLs, etc
- 📡 **WebSocket Broadcasting API** - Send custom messages to all connected clients
  - New `GibRuns.broadcast(message)` method
  - Broadcast custom reload triggers or notifications
  - Useful for custom build tools and integrations

### Improved
- 🔧 **Better Error Handling** - More informative error messages with stack traces
- 📊 **Enhanced Health Monitoring** - More detailed system metrics
- 🎯 **Middleware Architecture** - Cleaner middleware loading and organization
- 📦 **Dependencies** - Added `dotenv` and `multer` for new features

### Technical
- Version bumped to 2.3.4
- All existing tests passing
- Backward compatible with all previous versions
- New middleware files: `upload.js`, `health.js`, `logger.js`, `error-page.js`
- Enhanced GibRuns object with `wsClients`, `autoRestart`, `restartCount` properties

## [2.3.0] - 2026-02-10

### Fixed - Critical
- 🔧 **NPM Script Mode** - Fixed major issues with `--npm-script` and `--exec` options
  - No longer creates duplicate HTTP server on port 8080
  - Browser no longer opens to wrong port (8080 instead of dev server port)
  - Static file serving disabled when npm script is running (prevents MIME type conflicts)
  - Fixed "Cannot GET /" and blank page issues with Vite/React/Vue projects
  - GIB-RUNS now acts as pure file watcher for live reload when npm script is active
- 🚫 **Browser Auto-Open** - Disabled automatic browser opening when using `--npm-script` or `--exec`
  - Prevents confusion with wrong port
  - Let the dev server (Vite, Next.js, etc) handle browser opening
- 🎯 **File Watcher** - Improved file watching with better ignore patterns
  - Ignores Vite temporary files (`.timestamp-*.mjs`)
  - Ignores common build artifacts (`.log`, `.lock`, `.tmp`)
  - Cleaner console output without spam

### Improved
- 📝 **Cleaner Logs** - Removed verbose output from process runner
  - No more `[npm]` or `[cmd]` prefixes cluttering output
  - Direct passthrough of npm script output
  - Only show errors when process exits with non-zero code
- 🎨 **Better UI** - Simplified status display
  - Removed norak "(Access from other devices)" text
  - Network URLs displayed directly without extra labels
  - Cleaner, more professional output
- ⚡ **Performance** - Optimized server startup
  - Minimal HTTP server for WebSocket when npm script is running
  - Reduced memory footprint in npm script mode
  - Faster startup time

### Technical
- Fixed JSHint warning about closure in loop (rate-limit middleware)
- All 32 tests still passing
- Zero ESLint/JSHint warnings
- Backward compatible with all existing features

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
- Network URLs prominently displayed

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
