<div align="center">
  <h1>🚀 01Blog - Social Learning Platform</h1>
  <p><em>A modern fullstack blogging platform where students share their learning journey</em></p>
  
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
  [![Angular](https://img.shields.io/badge/Angular-20.2.0-red.svg)](https://angular.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.2-blue.svg)](https://www.postgresql.org/)
  [![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

---

## 📖 Table of Contents
- [About The Project](#-about-the-project)
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [How to Run](#-how-to-run)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🎯 About The Project

**01Blog** is a comprehensive social blogging platform designed specifically for students to document and share their learning experiences. It combines the power of modern web technologies to create an engaging, secure, and feature-rich environment where learners can:

- 📝 **Share their journey** through rich blog posts with multimedia support
- 👥 **Build a community** by following other students and engaging with their content
- 💬 **Foster discussions** through comments and interactions
- 🔔 **Stay connected** with real-time notifications
- 🛡️ **Report inappropriate content** to maintain a safe learning environment
- 👨‍💼 **Moderate effectively** through a powerful admin dashboard

This project demonstrates professional fullstack development practices, including RESTful API design, secure authentication, role-based access control, and modern reactive frontend patterns.

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure User Registration & Login** with JWT-based authentication
- **Role-Based Access Control** (User & Admin roles)
- **Password Encryption** using industry-standard hashing
- **Protected Routes** on both frontend and backend

### 👤 User Profiles & Social Features
- **Personal Block Pages** - Each user has their own profile showcasing their posts
- **Follow System** - Subscribe to other users and build your network
- **Discover Users** - Explore the community and find interesting profiles
- **Profile Management** - Edit profile information and avatar

### 📝 Content Management
- **Rich Post Creation** with text, images, and video support
- **CRUD Operations** - Create, read, update, and delete posts
- **Media Upload** - Support for images and videos (up to 10MB per file)
- **Media Preview** - Instant preview of uploaded media
- **Content Sanitization** - HTML sanitization to prevent XSS attacks
- **Read Time Estimation** - Automatic calculation of reading time

### � Engagement & Interaction
- **Like System** - Show appreciation for posts
- **Comment System** - Engage in discussions with nested comments
- **Real-time Updates** - Notifications for new activities
- **Activity Feed** - Personalized home feed from followed users

### 🔔 Notification System
- **Smart Notifications** for new posts from followed users
- **Mark as Read/Unread** functionality
- **Notification Badge** - Visual indicator for unread notifications
- **Activity Tracking** - Stay informed about community interactions

### 🚨 Reporting & Moderation
- **User Reporting** - Report inappropriate profiles with detailed reasons
- **Report Management** - Track and review all reports
- **Safety First** - Maintain a respectful learning environment

### 👨‍💼 Admin Dashboard
- **User Management** - View, ban, or delete users
- **Content Moderation** - Remove or hide inappropriate posts
- **Report Handling** - Review and take action on user reports
- **Statistics Overview** - Monitor platform activity
- **Comprehensive Controls** - Full administrative capabilities

### 🎨 User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Material Design** - Beautiful UI with Angular Material components
- **Drag & Drop Upload** - Intuitive file upload experience
- **Loading States** - Clear feedback during async operations
- **Error Handling** - User-friendly error messages and recovery

---

## 🛠️ Technologies Used

### Backend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17 | Core programming language |
| **Spring Boot** | 3.5.5 | Application framework |
| **Spring Security** | 6.x | Authentication & authorization |
| **Spring Data JPA** | 3.x | Database ORM |
| **PostgreSQL** | 16.2 | Relational database |
| **JWT (JJWT)** | 0.11.5 | Token-based authentication |
| **Maven** | 3.x | Dependency management & build |
| **OWASP HTML Sanitizer** | 20220608.1 | XSS prevention |
| **Hibernate Validator** | 8.x | Input validation |

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Angular** | 20.2.0 | Frontend framework |
| **TypeScript** | 5.9.2 | Type-safe JavaScript |
| **Angular Material** | 20.2.1 | UI component library |
| **RxJS** | 7.8.0 | Reactive programming |
| **Angular Router** | 20.2.0 | Client-side routing |
| **Angular CDK** | 20.2.1 | Component dev kit |
| **Karma & Jasmine** | Latest | Testing framework |

### DevOps & Infrastructure
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Docker** | Latest | Containerization |
| **Docker Compose** | 3.9 | Multi-container orchestration |
| **Nginx** | Latest | Frontend web server |
| **Git** | Latest | Version control |

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Angular 20     │◄────────┤   Spring Boot    │◄────────┤  PostgreSQL     │
│  Frontend       │  HTTP   │   Backend API    │  JDBC   │  Database       │
│  (Port 4200)    │         │   (Port 8080)    │         │  (Port 5432)    │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │                            │                            │
        └────────────────────────────┴────────────────────────────┘
                        Docker Network (app-network)
```

### Backend Architecture (Layered)
```
Controllers (REST API Endpoints)
        ↓
Services (Business Logic)
        ↓
Repositories (Data Access)
        ↓
Models/Entities (Domain Objects)
        ↓
PostgreSQL Database
```

### Frontend Architecture (Component-Based)
```
App Component (Root)
    ├── Core (Guards, Interceptors, Services)
    ├── Features (Smart Components)
    │   ├── Authentication (Login, Register)
    │   ├── Home (Feed)
    │   ├── Profile (User Pages)
    │   ├── Posts (Create, Edit, Detail)
    │   ├── Discovery (Explore)
    │   ├── Notifications
    │   ├── Admin Dashboard
    │   └── Reports
    └── Shared (Reusable Components)
        ├── Navbar
        ├── Follow Component
        └── Confirm Dialog
```

---

## � Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Java JDK 17+** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Node.js (LTS)** - [Download](https://nodejs.org/)
- **PostgreSQL 16+** - [Download](https://www.postgresql.org/download/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Angular CLI** - Install with `npm install -g @angular/cli`
- **Git** - [Download](https://git-scm.com/downloads)

Optional (for Docker deployment):
- **Docker** - [Download](https://www.docker.com/get-started)
- **Docker Compose** - [Download](https://docs.docker.com/compose/install/)

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE dbname;
CREATE USER dbuser WITH PASSWORD 'dbpassword';
GRANT ALL PRIVILEGES ON DATABASE dbname TO dbuser;
```

2. The application uses Hibernate's `ddl-auto=update`, so tables will be created automatically on first run.

---

## 🎬 How to Run

### Option 1: Local Development (Recommended for Development)

#### Backend

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 01blog
   ```

2. **Configure the database** (Optional - defaults are set)
   
   Edit `backend/src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5332/dbname
   spring.datasource.username=dbuser
   spring.datasource.password=dbpassword
   ```

3. **Navigate to backend directory**
   ```bash
   cd backend
   ```

4. **Build the project**
   ```bash
   ./mvnw clean install
   ```

5. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start at **http://localhost:8080**

   ✅ **Backend API Ready!** You should see: `Started BackendApplication in X.XXX seconds`

#### Frontend

1. **Open a new terminal** and navigate to frontend directory
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   Or alternatively:
   ```bash
   ng serve
   ```

   The frontend will be available at **http://localhost:4200**

   ✅ **Frontend Ready!** Your browser should automatically open to the application

4. **Default Admin Credentials** (if seeded):
   - Email: `admin@01blog.com`
   - Password: `01Blog123@`

---

### Option 2: Docker Deployment (Recommended for Production)

The easiest way to run the entire stack with a single command!

1. **Ensure Docker and Docker Compose are installed**
   ```bash
   docker --version
   docker compose version
   ```

2. **Navigate to project root**
   ```bash
   cd 01blog
   ```

3. **Build and start all services**
   ```bash
   docker compose up --build
   ```

   Or run in detached mode:
   ```bash
   docker compose up -d --build
   ```

4. **Access the application**
   - Frontend: **http://localhost:4200**
   - Backend API: **http://localhost:8080**
   - PostgreSQL: **localhost:5332**

5. **Stop the services**
   ```bash
   docker compose down
   ```

   To remove volumes (database data):
   ```bash
   docker compose down -v
   ```

#### Docker Services
- **postgres-spring-boot** - PostgreSQL database (Port 5332)
- **spring-boot-backend** - Spring Boot API (Port 8080)
- **angular-frontend** - Angular SPA (Port 4200 → 80)

---

### Option 3: Production Build

#### Backend JAR

```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

#### Frontend Production Build

```bash
cd frontend
npm run build
# Serve the dist/frontend directory with any web server
```

---

## 🛠️ Development

### Running Tests

Backend tests:
```bash
cd backend
./mvnw test
```

Frontend tests:
```bash
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
./mvnw clean package
```

Frontend:
```bash
cd backend
./mvnw test
```

Frontend tests:
```bash
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
./mvnw clean package
# JAR file will be in target/backend-0.0.1-SNAPSHOT.jar
```

Frontend:
```bash
cd frontend
npm run build
# Production files will be in dist/frontend
```

---

## 🔒 Security

### Security Features Implemented

#### Authentication & Authorization
- **JWT Token-Based Authentication** - Secure, stateless authentication
- **BCrypt Password Hashing** - Industry-standard password encryption
- **Role-Based Access Control (RBAC)** - User and Admin roles
- **Protected Routes** - Frontend guards and backend security filters
- **Token Expiration** - 3-day expiration with automatic logout

#### Input Validation & Sanitization
- **Server-Side Validation** - Using Hibernate Validator
- **HTML Sanitization** - OWASP Java HTML Sanitizer prevents XSS
- **File Type Validation** - Only allowed image/video formats
- **File Size Limits** - 10MB per file, 100MB per request
- **SQL Injection Prevention** - JPA/Hibernate parameterized queries

#### HTTP Security
- **CORS Configuration** - Properly configured cross-origin requests
- **CSRF Protection** - Disabled for stateless JWT (API-only)
- **Security Headers** - Configured via Spring Security
- **HTTPS Ready** - Production configuration supports TLS/SSL

#### Data Protection
- **Password Never Exposed** - Excluded from JSON serialization
- **Sensitive Data Handling** - Proper DTO usage
- **Audit Trail** - Timestamp tracking on entities
- **Private File Storage** - Files served through controlled endpoints

### Security Best Practices

1. **Change Default Credentials** in production
2. **Use Environment Variables** for sensitive configuration
3. **Enable HTTPS** in production environments
4. **Implement Rate Limiting** for API endpoints
5. **Regular Security Updates** - Keep dependencies up to date
6. **Database Backups** - Regular automated backups
7. **Monitor Logs** - Track suspicious activities

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**Issue: Port 8080 already in use**
```bash
# Find process using port 8080
lsof -i :8080
# Kill the process
kill -9 <PID>
```

**Issue: Database connection failed**
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `application.properties`
- Ensure database `DB01B` exists

**Issue: Maven build fails**
```bash
# Clean and rebuild
./mvnw clean install -U
```

#### Frontend Issues

**Issue: Port 4200 already in use**
```bash
# Run on different port
ng serve --port 4201
```

**Issue: npm install fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue: API calls fail (CORS)**
- Verify backend is running on port 8080
- Check CORS configuration in `SecurityConfig.java`

#### Docker Issues

**Issue: Docker build fails**
```bash
# Clear Docker cache
docker system prune -a
docker compose build --no-cache
```

**Issue: Container fails to start**
```bash
# Check logs
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

---

## 📊 Database Schema

### Key Tables

- **users** - User accounts and profiles
- **posts** - Blog posts with media
- **follows** - User follow relationships
- **likes** - Post likes
- **comments** - Post comments
- **notifications** - User notifications
- **reports** - User/Post reports (moderation)

---

## 🚀 Deployment

### Deployment to Production

#### Using Docker (Recommended)

1. **Configure production environment variables** in `docker-compose.yaml`
2. **Update API URLs** in Angular environment files
3. **Build and deploy**:
```bash
docker compose -f docker-compose.prod.yaml up -d
```

#### Manual Deployment

**Backend (Spring Boot)**
```bash
# Build JAR
./mvnw clean package -DskipTests

# Run with production profile
java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Frontend (Angular)**
```bash
# Build for production
ng build --configuration production

# Serve with Nginx or any web server
# Files are in dist/frontend
```

### Cloud Deployment Options

- **AWS**: Elastic Beanstalk, EC2, RDS, S3
- **Google Cloud**: App Engine, Cloud SQL, Cloud Storage
- **Azure**: App Service, Azure Database for PostgreSQL
- **Heroku**: Heroku Postgres, Dyno deployment
- **DigitalOcean**: Droplets, Managed Databases

---

## 🤝 Contributing

We welcome contributions to 01Blog! Here's how you can help:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/khlifihamza/01blog.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write meaningful commit messages
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure all tests pass

### Contribution Guidelines

- **Code Style**: Follow Java and TypeScript best practices
- **Commits**: Use conventional commit messages (feat, fix, docs, etc.)
- **Testing**: Include unit tests for new features
- **Documentation**: Update README and code comments
- **Issues**: Report bugs with clear reproduction steps

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

### Main Developer
- **Hamza Khlifi** - *Initial work & Full-stack development* - [@khlifihamza](https://github.com/khlifihamza)

### Contributors
Want to see your name here? [Contribute to the project!](#-contributing)

---

## 🙏 Acknowledgments

- **Spring Boot Team** - For the excellent framework and documentation
- **Angular Team** - For the powerful frontend framework
- **Material Design** - For the beautiful UI components
- **PostgreSQL** - For the robust database system
- **Open Source Community** - For countless libraries and tools
- **01 Edu System** - For the learning opportunity and project inspiration

---

## 📞 Support & Contact

### Get Help

- 📖 **Documentation**: Read this README thoroughly
- 🐛 **Bug Reports**: [Open an issue](https://github.com/khlifihamza/01blog/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/khlifihamza/01blog/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/khlifihamza/01blog/discussions)

---

## 📜 Changelog

### Version 1.0.0 (Current)
- ✅ User authentication and authorization
- ✅ User profiles and following system
- ✅ Post creation with media upload
- ✅ Like and comment functionality
- ✅ Notification system
- ✅ User reporting and moderation
- ✅ Admin dashboard
- ✅ Discovery page
- ✅ Responsive design
- ✅ Docker deployment
- ✅ Security features (JWT, XSS prevention)

---

<div align="center">
  <h3>⭐ Star this repository if you found it helpful! ⭐</h3>
  <p>Made with ❤️ by <a href="https://github.com/khlifihamza">Hamza Khlifi</a></p>
  <p>
    <a href="#-table-of-contents">Back to Top ↑</a>
  </p>
</div>