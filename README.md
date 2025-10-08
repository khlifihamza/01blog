# Blog Web Application

A modern web application built with Angular frontend and Spring Boot backend, featuring a blog platform with image and video upload capabilities.

## 🚀 Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.5**
- **PostgreSQL** - Database
- **Maven** - Dependency management and build tool
- **Spring Web** - RESTful API development
- **Spring Test** - Testing framework

### Frontend
- **Angular 20**
- **Angular Material 20.2.1** - UI component library
- **RxJS 7.8.0** - Reactive programming library
- **TypeScript 5.9.2**
- **Karma & Jasmine** - Testing framework

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Java JDK 17 or later
- Node.js (LTS version recommended)
- npm (comes with Node.js)
- PostgreSQL
- Maven
- Angular CLI (`npm install -g @angular/cli`)

## 🔧 Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```bash
   ./mvnw clean install
   ```

3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will be available at `http://localhost:4200`

## 📁 Project Structure

```
01blog/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/      # Java source files
│   │   │   └── resources/ # Application properties
│   │   └── test/          # Test files
│   ├── pom.xml            # Maven configuration
│   └── upload/            # Media storage directory
│       ├── images/        # Uploaded images
│       └── videos/        # Uploaded videos
│
└── frontend/              # Angular frontend
    ├── src/
    │   ├── app/          # Application components
    │   ├── assets/       # Static assets
    │   └── styles/       # Global styles
    ├── angular.json      # Angular configuration
    └── package.json      # npm configuration
```

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
cd frontend
npm run build
```


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with this project
- Special thanks to the Angular and Spring Boot communities for their excellent documentation
