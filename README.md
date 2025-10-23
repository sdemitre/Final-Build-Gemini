# Public Health Research Collaboration Platform

A comprehensive web platform for public health researchers to collaborate, share unpublished papers for peer review, and access infectious disease data.

## 🎯 Project Overview

This platform enables public health researchers, analysts, and research scientists to:

- **Submit unpublished papers** for informal peer review and feedback
- **Collaborate** with other researchers for joint publications
- **Access disease outbreak data** through an interactive world map
- **Find job opportunities** in public health research
- **Share and search research data** from verified sources
- **Connect with researchers** from recognized institutions worldwide

## 🏗️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **Express validation** and security middleware

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React Query** for data fetching
- **Leaflet** for interactive maps
- **React Hook Form** for form management
- **React Toastify** for notifications

### Development Tools
- **Concurrently** for running client and server
- **Nodemon** for server development
- **TypeScript** for type safety

## 🚀 Getting Started

### Option 1: Docker (Recommended) 🐳

The easiest way to get started is with Docker, which handles all dependencies automatically.

#### Prerequisites
- **Docker Desktop** - Download from [docker.com](https://docs.docker.com/desktop/install/windows-install/)

#### Quick Start with Docker
1. **Install Docker Desktop** and make sure it's running
2. **Run the setup script**:
   ```bash
   # Windows
   docker-setup.bat
   
   # Or run commands manually:
   docker pull node:22-alpine
   docker-compose -f docker-compose.dev.yml up --build
   ```
3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Database: PostgreSQL on port 5432

#### Docker Commands
```bash
# Start development environment
npm run docker:dev

# Stop all services
npm run docker:dev:down

# View logs
npm run docker:logs

# Production deployment
npm run docker:prod
```

### Option 2: Local Installation

#### Prerequisites
1. **Node.js** (version 18.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - This includes npm (Node Package Manager)

2. **PostgreSQL** (version 12 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Create a database named `ph_research_db`

3. **Git** (for version control)
   - Download from [git-scm.com](https://git-scm.com/)

#### Installation Steps

1. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   psql -U postgres
   CREATE DATABASE ph_research_db;
   \q
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cd server
   cp .env.example .env
   
   # Edit .env file with your database credentials
   # Update DB_PASSWORD with your PostgreSQL password
   ```

4. **Initialize Database Tables**
   ```bash
   # Run the database schema creation
   cd server
   node -e "require('./database/schema').createTables()"
   ```

5. **Start Development Servers**
   ```bash
   # From the root directory, start both client and server
   npm run dev
   
   # Or start individually:
   # Server (Port 5000)
   npm run server
   
   # Client (Port 3000)
   npm run client
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🗂️ Project Structure

```
public-health-research-platform/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Utility functions
│   └── package.json
├── server/                     # Node.js backend
│   ├── routes/                # API route handlers
│   ├── middleware/            # Express middleware
│   ├── config/                # Configuration files
│   ├── database/              # Database schemas and queries
│   └── package.json
├── .github/                   # GitHub configuration
│   └── copilot-instructions.md
├── package.json               # Root package.json
└── README.md
```

## 🔧 Development Commands

### Docker Commands (Recommended)
```bash
# Development
npm run docker:dev             # Start development environment with hot reload
npm run docker:dev:down        # Stop development environment
npm run docker:logs            # View application logs
npm run docker:clean           # Clean up Docker resources

# Production
npm run docker:prod            # Start production environment
npm run docker:prod:down       # Stop production environment
npm run docker:build           # Build production image

# Manual Docker commands
docker-compose -f docker-compose.dev.yml up --build    # Start dev
docker-compose -f docker-compose.dev.yml down          # Stop dev
docker-compose up --build -d                           # Start prod
```

### Local Development Commands
```bash
# Root level commands
npm run dev                    # Start both client and server
npm run install-all           # Install all dependencies
npm run build                 # Build client for production

# Server commands (from /server)
npm start                     # Start production server
npm run dev                   # Start development server with nodemon
npm test                      # Run server tests

# Client commands (from /client)
npm start                     # Start development server
npm run build                 # Build for production
npm test                      # Run client tests
```

## 🌟 Key Features

### 1. Paper Submission & Review System
- Submit unpublished research papers
- Peer review and feedback system
- Collaboration requests and agreements
- Version control for paper revisions

### 2. Interactive Disease Map
- Real-time disease outbreak data
- Geographic visualization with Leaflet
- Filter by disease type, region, and time period
- Hover interactions for detailed information

### 3. Researcher Network
- Verified researcher profiles
- Institution and specialization filtering
- Collaboration history and ratings
- LinkedIn and CV integration

### 4. Job Board
- Public health research positions
- Filter by location, type, and salary
- Direct links to employer applications
- Research funding opportunities

### 5. Data Repository
- Searchable research data archive
- Filter by demographics, data type, and region
- Published and unpublished datasets
- Data sharing agreements

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

## 🗄️ Database Schema

### Main Tables
- **users** - Researcher profiles and authentication
- **papers** - Research papers and metadata
- **reviews** - Peer review comments and ratings
- **collaborations** - Research collaboration agreements
- **disease_outbreaks** - Global disease outbreak data
- **jobs** - Job opportunities and postings

## � Docker Architecture

The application uses a multi-container setup:

- **app-dev/app**: Main Node.js application (React + Express)
- **postgres**: PostgreSQL database with persistent storage
- **redis**: Redis for session storage and caching
- **nginx**: Reverse proxy for production (optional)

### Docker Development Features
- **Hot reload**: Code changes automatically restart the application
- **Volume mapping**: Your local code is mapped into the container
- **Database persistence**: Data survives container restarts
- **Health checks**: Automatic service monitoring
- **Security**: Non-root user execution

### Docker Files Explained
- `Dockerfile`: Production image with optimized layers
- `Dockerfile.dev`: Development image with hot reload
- `docker-compose.dev.yml`: Development environment
- `docker-compose.yml`: Production environment
- `.dockerignore`: Excludes unnecessary files from build

## �🚀 Deployment

### Docker Production Deployment
```bash
# Copy production environment template
cp .env.production .env

# Edit .env with your production values
# Set strong passwords and secrets!

# Deploy with Docker Compose
npm run docker:prod

# View deployment logs
docker-compose logs -f
```

### Environment Variables
Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ph_research_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your_very_secure_jwt_secret
CLIENT_URL=https://your-domain.com
REDIS_PASSWORD=your_redis_password
```

### Traditional Deployment
```bash
# Build client
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Paper Endpoints
- `GET /api/papers` - List papers with filtering
- `POST /api/papers` - Submit new paper
- `GET /api/papers/:id` - Get paper details
- `POST /api/papers/:id/reviews` - Add review

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search` - Search researchers

### Disease Endpoints
- `GET /api/diseases/outbreaks` - Get outbreak data
- `GET /api/diseases/statistics` - Get disease statistics

### Job Endpoints
- `GET /api/jobs` - List job opportunities
- `GET /api/jobs/:id` - Get job details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔮 Future Enhancements

- Real-time chat for collaborations
- Advanced analytics dashboard
- Mobile application
- Integration with research databases
- Automated literature recommendations
- Grant funding database
- Conference and event listings
- Research group formation tools

---

**Built with ❤️ for the global public health research community**#   F i n a l - B u i l d  
 