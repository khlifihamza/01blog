# AI Agent Instructions for 01Blog

This guide helps AI agents understand key patterns and workflows in the 01Blog codebase - a fullstack social blogging platform using Spring Boot and Angular.

## Project Architecture

### Backend (Spring Boot)
- **Service Boundaries**: Clear separation between user management, post handling, and content moderation
- **Key Directories**:
  - `backend/src/main/java/com/dev/backend/`: Core application code
  - `backend/src/main/resources/`: Configuration files
  - `backend/upload/`: Media storage for user uploads (images/videos)

### Frontend (Angular)
- **Component Structure**: Uses Angular Material UI components
- **State Management**: Leverages RxJS for reactive data flow
- **Key Directories**: 
  - `frontend/src/app/`: Angular application modules and components
  - `frontend/src/global_styles.css`: Global styling definitions

## Development Workflows

### Setup & Configuration
```properties
# Required in backend/src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/blog01_db
spring.datasource.username=<username>
spring.datasource.password=<password>
app.jwtSecret=<secret>
app.upload.dir=./uploads
```

### Common Commands
- Backend: `mvn spring-boot:run` (from /backend)
- Frontend: `ng serve` (from /frontend)
- Build Frontend: `ng build` (outputs to dist/)
- Tests: 
  - Backend: `mvn test`
  - Frontend: `ng test`

## Key Patterns & Conventions

### Backend Patterns
1. **Media Handling**: Upload directory structure at `backend/upload/{images,videos}/`
2. **Security**: JWT-based authentication with role-based access control
3. **Error Handling**: Standardized error responses through exception handlers

### Frontend Patterns
1. **State Management**: Services maintain state using RxJS observables
2. **Component Organization**: Feature modules for logical grouping
3. **Styling**: Angular Material theming with global styles in `global_styles.css`

## Integration Points
- Backend API endpoints served at `http://localhost:8080`
- Frontend development server at `http://localhost:4200`
- PostgreSQL database connection required
- File upload size limits: 10MB per file

## Development Tips
1. Always run both frontend and backend servers during development
2. Check JWT token expiration (default 24h) in security configurations
3. Use Angular CLI for generating components/services
4. Media uploads are stored in `backend/upload/` - ensure directory exists

## Common Pitfalls
- Ensure PostgreSQL is running before starting backend
- Check CORS settings if integrating new frontend features
- Verify file permissions for upload directory
- Monitor JWT token expiration in frontend services