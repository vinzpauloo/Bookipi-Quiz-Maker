# Bookipi - Quiz Maker

A full-stack quiz maker application built with modern web technologies.

---

## 🎨 Frontend

### Tech Stack
- **Runtime:** Bun
- **Build Tool:** Vite 7.2
- **Framework:** React 19.2
- **Data Fetching:** TanStack Query 5.90
- **Language:** TypeScript 5.9

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies using Bun
bun install
```

### Available Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build for production (TypeScript + Vite) |
| `bun run lint` | Run ESLint to check code quality |
| `bun run preview` | Preview production build locally |

### Quick Start

```bash
# Start development server
bun run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port)

---

## ⚙️ Backend

### Tech Stack
- **Runtime:** Node.js v23.10
- **Package Manager:** npm
- **Framework:** Express 4.21
- **Database:** SQLite (better-sqlite3 12.4)
- **Testing:** Jest 29.7
- **Dev Tools:** Nodemon 3.1

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies using npm
npm install
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-restart |
| `npm run seed` | Seed database with initial data |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Quick Start

```bash
# Seed the database (first time only)
npm run seed

# Start development server
npm run dev
```

The backend API will be available at the configured port (check `src/server.js` for details)

---

## 🚀 Full Stack Setup

### Prerequisites
- **Node.js** v23+ (for backend)
- **Bun** latest version (for frontend)
- **Git** (for version control)

### Complete Setup

```bash
# Clone the repository (if not already cloned)
git clone <repository-url>
cd Bookipi

# Setup Backend
cd backend
npm install
npm run seed
npm run dev

# In a new terminal, setup Frontend
cd ../frontend
bun install
bun run dev
```

### Project Structure

```
Bookipi/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Express + SQLite backend
│   ├── src/
│   ├── tests/
│   ├── sql/
│   └── package.json
├── INSTALLATION_GUIDE.md  # Detailed setup guide
└── README.md          # This file
```

---

## 📚 Additional Documentation

- **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Detailed installation troubleshooting and environment setup
- **[backend/README.md](./backend/README.md)** - Backend-specific documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend-specific documentation

---

## 🛠️ Development Workflow

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   bun run dev
   ```

3. **Run Tests** (Terminal 3 - Optional):
   ```bash
   cd backend
   npm run test:watch
   ```

---

## 📝 Notes

- Frontend uses **Bun** for faster dependency management and runtime
- Backend uses **npm** for stability with native modules (better-sqlite3)
- SQLite database is file-based (no external database server needed)
- CORS is configured for local development

---

**Version:** 1.0  
**Last Updated:** November 11, 2025