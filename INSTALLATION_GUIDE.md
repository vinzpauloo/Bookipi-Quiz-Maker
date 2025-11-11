# Backend Installation Guide

## Overview
This document details the installation process for the Bookipi backend, including issues encountered and their resolutions.

---

## Installation Issues & Resolutions

### Issue 1: NPM Permission Error (EPERM)
**Error:**
```
npm error code EPERM
npm error syscall open
npm error errno -1
npm error Error: EPERM: operation not permitted
```

**Cause:**
The initial installation attempt ran into permission issues due to sandbox restrictions when accessing npm's global node_modules.

**Resolution:**
Ran the npm install command with elevated permissions by using the `all` permission flag to bypass sandbox restrictions.

---

### Issue 2: better-sqlite3 Compilation Failure
**Error:**
```
error: "C++20 or later required."
error: no template named 'CopyablePersistentTraits' in namespace 'v8'
error: no type named 'AccessorGetterCallback' in namespace 'v8'
gyp ERR! build error
make: *** [Release/obj.target/better_sqlite3/src/better_sqlite3.o] Error 1
```

**Cause:**
The package.json specified `better-sqlite3@^9.4.0`, which is incompatible with Node.js v23.10.0. The native C++ addon failed to compile due to breaking changes in the V8 JavaScript engine API between Node versions.

**Resolution:**
Upgraded `better-sqlite3` to the latest version (12.4.1):
```bash
npm install better-sqlite3@latest
```

The latest version includes compatibility updates for Node.js v23 and the newer V8 API.

---

### Issue 3: Deprecated Dependencies
**Warnings:**
- `supertest@6.3.4` - deprecated, maintenance moved
- `superagent@8.1.2` - deprecated
- `inflight@1.0.6` - deprecated, has memory leaks
- `glob@7.2.3` - no longer supported

**Resolution:**
- Upgraded `supertest` to latest version (7.1.4):
  ```bash
  npm install supertest@latest --save-dev
  ```
- Other deprecated packages are transitive dependencies that were automatically updated
- Note: Some warnings persist as they come from nested dependencies of Jest

---

### Issue 4: Security Vulnerability
**Warning:**
```
1 high severity vulnerability
```

**Resolution:**
Ran npm's automatic fix:
```bash
npm audit fix
```

This automatically resolved the vulnerability by updating the affected package(s) to secure versions.

---

## Environment Details

### System Information
- **OS:** macOS 25.1.0 (Darwin)
- **Node.js:** v23.10.0
- **npm:** (latest)
- **Architecture:** ARM64 (Apple Silicon)

### Final Installed Packages

#### Production Dependencies
- `better-sqlite3@12.4.1` - SQLite database interface
- `cors@2.8.5` - Cross-Origin Resource Sharing middleware
- `dotenv@16.6.1` - Environment variable management
- `express@4.21.2` - Web framework

#### Development Dependencies
- `jest@29.7.0` - Testing framework
- `nodemon@3.1.10` - Auto-restart development server
- `supertest@7.1.4` - HTTP assertion library for testing

---

## Available NPM Commands

### Production Commands

#### `npm start`
Starts the production server.
```bash
npm start
```
- Runs: `node src/server.js`
- Use this for production deployment
- Server runs without auto-restart

---

### Development Commands

#### `npm run dev`
Starts the development server with auto-restart.
```bash
npm run dev
```
- Runs: `nodemon src/server.js`
- Automatically restarts server on file changes
- Ideal for local development
- Watches all `.js` files in the project

---

### Database Commands

#### `npm run seed`
Seeds the database with initial data.
```bash
npm run seed
```
- Runs: `node src/seed.js`
- Populates database with sample/initial data
- Useful for development and testing

---

### Testing Commands

#### `npm test`
Runs all tests once.
```bash
npm test
```
- Runs: `jest`
- Executes all test files in `tests/` directory
- Displays test results and summary
- Exit codes: 0 (pass), 1 (fail)

#### `npm run test:watch`
Runs tests in watch mode.
```bash
npm run test:watch
```
- Runs: `jest --watch`
- Watches for file changes
- Re-runs affected tests automatically
- Interactive mode with options to filter tests
- Press 'q' to quit watch mode

#### `npm run test:coverage`
Runs tests with coverage report.
```bash
npm run test:coverage
```
- Runs: `jest --coverage`
- Generates code coverage report
- Shows percentage of code covered by tests
- Creates `coverage/` directory with detailed HTML reports
- Excludes `src/seed.js` from coverage metrics

---

## Quick Start Guide

### First Time Setup
```bash
# Navigate to backend directory
cd /Users/vincentpauloo/Documents/Bookipi/backend

# Install all dependencies (already done)
npm install

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Daily Development Workflow
```bash
# Start development server (auto-restarts on changes)
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch
```

### Before Deployment
```bash
# Run full test suite
npm test

# Check test coverage
npm run test:coverage

# Ensure no vulnerabilities
npm audit

# Start production server (test locally)
npm start
```

---

## Test Configuration

Tests are configured in `package.json`:
- **Environment:** Node.js
- **Test Pattern:** `**/tests/**/*.test.js`
- **Coverage Collection:** All files in `src/` except `seed.js`
- **Coverage Output:** `coverage/` directory
- **Verbose Mode:** Enabled for detailed output

---

## Troubleshooting

### If `npm install` fails again:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules/`: `rm -rf node_modules`
3. Delete `package-lock.json`: `rm package-lock.json`
4. Reinstall: `npm install`

### If tests fail:
1. Ensure database is seeded: `npm run seed`
2. Check for port conflicts (default: usually 3000 or 5000)
3. Review test output for specific errors
4. Check `src/db.js` for database path configuration

### If the server won't start:
1. Check if port is already in use
2. Verify `.env` file exists and is properly configured
3. Ensure database file exists or can be created
4. Check logs for specific error messages

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Jest Documentation](https://jestjs.io/)
- [Node.js Documentation](https://nodejs.org/)

---

## Notes

- All packages are now compatible with Node.js v23+
- No known security vulnerabilities
- Database file will be created automatically on first run
- SQLite database is file-based (no external database server needed)
- CORS is enabled for cross-origin requests

---

**Document Version:** 1.0  
**Last Updated:** November 11, 2025  
**Node.js Version:** v23.10.0  
**Platform:** macOS (ARM64)

