# Backstage Node App

A simple Node.js Express application designed as an example for Backstage integration.

## Features

- RESTful API endpoints
- Health check endpoint
- Service management endpoints
- User management endpoints
- Docker containerization
- Security middleware (Helmet, CORS)
- Request logging (Morgan)

## API Endpoints

### Base Endpoints
- `GET /` - Welcome message and API documentation
- `GET /health` - Health check with system and Git information
- `GET /api-status` - Comprehensive API status with GitHub integration
- `GET /api` - API information

### User Endpoints
- `GET /api/users` - List all users

### Service Endpoints
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get specific service details
- `POST /api/services` - Create a new service

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The server will be available at `http://localhost:3000`

### Docker

1. Build the Docker image:
```bash
docker build -t backstage-node-app .
```

2. Run the container:
```bash
docker run -p 3000:3000 backstage-node-app
```

3. The server will be available at `http://localhost:3000`

### Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Then run:
```bash
docker-compose up
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `GITHUB_TOKEN` - GitHub API token for repository information (optional)
- `GITHUB_OWNER` - GitHub repository owner (default: fnaraujo)
- `GITHUB_REPO` - GitHub repository name (default: backstage-node-app)

### GitHub Integration Setup

1. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Generate a new token with `repo` scope
   - Copy the token

2. Set environment variables:
```bash
export GITHUB_TOKEN=your_token_here
export GITHUB_OWNER=your_username
export GITHUB_REPO=your_repo_name
```

Or create a `.env` file (copy from `env.example`):
```bash
cp env.example .env
# Edit .env with your values
```

## Backstage Integration

This application is designed to be easily integrated with Backstage. The API endpoints provide:

1. **Service Discovery**: The `/api/services` endpoint can be used by Backstage to discover and catalog services
2. **Health Monitoring**: The `/health` endpoint provides health status with Git information
3. **Comprehensive Status**: The `/api-status` endpoint provides detailed service information including:
   - System metrics (memory, CPU, uptime)
   - Git information (branch, last commit, author)
   - GitHub repository data (stars, forks, issues, workflows)
   - Service metadata and endpoints
4. **Metadata**: Service endpoints include version, deployment status, and metrics information

### Example Backstage Integration

You can use this app as a backend service in your Backstage catalog by adding it to your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage-node-app
  description: Example Node.js service for Backstage integration
spec:
  type: service
  lifecycle: production
  owner: platform-team
  providesApis:
    - backstage-node-app-api
```

## Development

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (placeholder)

### Project Structure

```
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── Dockerfile         # Docker configuration
├── .dockerignore      # Docker ignore file
└── README.md          # This file
```

## Security

The application includes several security middleware:

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configures Cross-Origin Resource Sharing
- **Input validation**: Basic validation for POST requests

## Monitoring

The application provides:

- Health check endpoint with system metrics
- Request logging with Morgan
- Error handling middleware
- Docker health checks

## License

MIT
