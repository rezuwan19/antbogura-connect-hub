# ANT Bogura - ISP Website

A modern ISP (Internet Service Provider) website built with React, Vite, TypeScript, and Tailwind CSS.

## 🏗️ Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Lovable Cloud (Edge Functions, Database, Authentication)
- **Deployment Options**: Docker, GitHub Pages, Local Development

---

## 🚀 Deployment Options

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.docker.example .env
   ```
   The `.env` file is pre-configured with the backend connection.

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:8080

5. **Build for production**
   ```bash
   npm run build
   ```
   The build output will be in the `dist` folder.

---

### Option 2: Docker Deployment (Frontend)

#### Prerequisites
- Docker and Docker Compose installed

#### Quick Start

1. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   cp .env.docker.example .env.docker
   ```

2. **Build and run**
   ```bash
   docker-compose --env-file .env.docker up -d --build
   ```
   Open http://localhost:8080

#### Docker Commands

```bash
# Build the image
docker-compose --env-file .env.docker build

# Start containers
docker-compose --env-file .env.docker up -d

# View logs
docker-compose logs -f web

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose --env-file .env.docker up -d --build

# Check container health
docker ps
docker inspect ant-bogura-web --format='{{.State.Health.Status}}'
```

#### Production Deployment with Docker

For production, you can use:

```bash
# Build production image
docker build \
  --build-arg VITE_SUPABASE_URL=https://wtdjlfwzakgwdallsiii.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key> \
  -t ant-bogura:production .

# Run production container
docker run -d \
  --name ant-bogura-production \
  -p 80:80 \
  --restart unless-stopped \
  ant-bogura:production
```

---

### Option 3: GitHub Pages Deployment (Frontend)

The repository includes automated GitHub Actions workflow for deploying to GitHub Pages.

#### Setup Steps

1. **Enable GitHub Pages**
   - Go to your repo → Settings → Pages
   - Set Source to "GitHub Actions"

2. **Add GitHub Secrets**
   Go to Settings → Secrets and variables → Actions → New repository secret:
   
   | Secret Name | Value |
   |-------------|-------|
   | `VITE_SUPABASE_URL` | `https://wtdjlfwzakgwdallsiii.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |

3. **Push to main branch**
   The workflow will automatically build and deploy.

4. **Access your site**
   Your site will be available at: `https://<username>.github.io/<repo-name>/`

#### Manual Trigger
You can also manually trigger deployment from Actions tab → "Deploy to GitHub Pages" → "Run workflow"

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── integrations/          # Backend integration
│   ├── lib/                   # Utilities
│   ├── pages/                 # Page components
│   └── main.tsx               # Entry point
├── supabase/
│   ├── config.toml            # Backend config
│   └── functions/             # Edge functions (backend)
├── docker-compose.yml         # Docker Compose config
├── Dockerfile                 # Docker build config
├── nginx.conf                 # Nginx config for Docker
└── .env.docker.example        # Environment template
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Backend API URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Backend public API key | Yes |
| `PORT` | Local server port (default: 8080) | No |

### Backend (Lovable Cloud)

The backend is hosted on Lovable Cloud and includes:
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: User login/signup with 2FA support
- **Edge Functions**: SMS notifications, admin operations
- **Storage**: File uploads (if needed)

> **Note**: Backend runs on Lovable Cloud and cannot be self-hosted via Docker. The Docker/GitHub Pages deployments only host the frontend, which connects to the cloud backend.

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - UI Components
- **React Router** - Routing
- **React Query** - Data fetching

---

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
