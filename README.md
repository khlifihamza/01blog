# 01Blog - Social Blogging Platform

A fullstack social blogging platform built with Spring Boot and Angular, designed for students to share their learning experiences, discoveries, and progress throughout their educational journey.

## 🚀 Features

### User Features
- **Authentication & Authorization**: Secure user registration and login with role-based access control
- **Personal Block Pages**: Each user has a public profile showcasing all their posts
- **Post Management**: Create, edit, and delete posts with media (images/videos) and text
- **Social Interactions**: Like and comment on posts, subscribe to other users
- **Real-time Notifications**: Get notified when subscribed users publish new content
- **Content Reporting**: Report inappropriate profiles or content with detailed reasons
- **Responsive Design**: Built with Angular Material for a modern, mobile-friendly experience

### Admin Features
- **Admin Dashboard**: Comprehensive management panel for users, posts, and reports
- **Content Moderation**: Review and manage reported content, ban users, remove posts
- **User Management**: View all registered users and their activity
- **Report Management**: Handle user reports with appropriate actions

## 🛠️ Technology Stack

### Backend
- **Java 17+**
- **Spring Boot 3.x**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **PostgreSQL** (Primary Database)
- **Maven** (Dependency Management)

### Frontend
- **Angular 16+**
- **Angular Material** (UI Components)
- **TypeScript**
- **RxJS** (Reactive Programming)
- **Angular CLI**

### Additional Tools
- **Git** (Version Control)
- **Postman** (API Testing)
- **IntelliJ IDEA / VS Code** (Development Environment)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Java 17** or higher
- **Node.js 18** or higher
- **npm** or **yarn**
- **PostgreSQL 13** or higher
- **Angular CLI**: `npm install -g @angular/cli`
- **Maven 3.6** or higher

## 🗄️ Database Setup

1. Install and start PostgreSQL
2. Create a new database:
   ```sql
   CREATE DATABASE blog01_db;
   ```
3. Update database configuration in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/blog01_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

## ⚙️ Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/01blog.git
   cd 01blog/backend
   ```

2. **Configure environment variables**:
   Create an `application-local.properties` file:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/blog01_db
   spring.datasource.username=your_db_username
   spring.datasource.password=your_db_password
   
   # JWT Configuration
   app.jwtSecret=mySecretKey
   app.jwtExpirationMs=86400000
   
   # File Upload Configuration
   app.upload.dir=./uploads
   spring.servlet.multipart.max-file-size=10MB
   spring.servlet.multipart.max-request-size=10MB
   ```

3. **Install dependencies and run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Verify backend is running**:
   - Backend will be available at: `http://localhost:8080`
   - API documentation (if Swagger is configured): `http://localhost:8080/swagger-ui.html`

## 🎨 Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Angular Material**:
   ```bash
   ng add @angular/material
   ```
   Select your preferred theme, typography, and animations when prompted.

4. **Configure environment**:
   Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api'
   };
   ```

5. **Start the development server**:
   ```bash
   ng serve
   ```

6. **Access the application**:
   - Frontend will be available at: `http://localhost:4200`

## 🏗️ Project Structure

```
01blog/
├── backend/
│   ├── src/main/java/com/blog01/
│   │   ├── controller/          # REST Controllers
│   │   ├── service/            # Business Logic
│   │   ├── repository/         # Data Access Layer
│   │   ├── model/             # Entity Classes
│   │   ├── config/            # Configuration Classes
│   │   └── security/          # Security Configuration
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── static/            # Static Resources
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular Components
│   │   │   ├── services/      # Angular Services
│   │   │   ├── guards/        # Route Guards
│   │   │   ├── models/        # TypeScript Models
│   │   │   └── shared/        # Shared Components
│   │   ├── assets/           # Static Assets
│   │   └── environments/     # Environment Configuration
│   ├── angular.json
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{userId}` - Get user by ID
- `POST /api/users/{userId}/subscribe` - Subscribe to user
- `DELETE /api/users/{userId}/subscribe` - Unsubscribe from user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/feed` - Get personalized feed
- `POST /api/posts` - Create new post
- `PUT /api/posts/{postId}` - Update post
- `DELETE /api/posts/{postId}` - Delete post
- `POST /api/posts/{postId}/like` - Like/unlike post
- `POST /api/posts/{postId}/comments` - Add comment

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/posts` - Get all posts
- `GET /api/admin/reports` - Get all reports
- `DELETE /api/admin/users/{userId}` - Ban user
- `DELETE /api/admin/posts/{postId}` - Remove post

## 🎯 Key Angular Material Components Used

- **MatToolbar** - Navigation header
- **MatSidenav** - Sidebar navigation
- **MatCard** - Post cards and user profiles
- **MatButton** - Action buttons
- **MatIcon** - Icons throughout the app
- **MatFormField** - Form inputs
- **MatDialog** - Modal dialogs for post creation/editing
- **MatSnackBar** - Toast notifications
- **MatPaginator** - Post pagination
- **MatTabs** - Tab navigation in user profiles
- **MatBadge** - Notification badges
- **MatMenu** - Dropdown menus

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### Backend Deployment
1. Build the JAR file:
   ```bash
   mvn clean package
   ```
2. Run the JAR:
   ```bash
   java -jar target/blog01-backend-1.0.0.jar
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   ng build --prod
   ```
2. Serve the `dist/` folder using a web server (nginx, Apache, etc.)

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Role-based access control** (USER/ADMIN roles)
- **Input validation** and sanitization
- **CORS configuration** for cross-origin requests
- **File upload security** with type and size validation
- **SQL injection prevention** using JPA/Hibernate

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure PostgreSQL is running
   - Check database credentials in `application.properties`
   - Verify database exists

2. **CORS Issues**:
   - Check CORS configuration in Spring Boot
   - Ensure frontend URL is allowed in CORS policy

3. **File Upload Issues**:
   - Check file size limits in `application.properties`
   - Ensure upload directory exists and has write permissions

4. **Angular Material Styling Issues**:
   - Import the Angular Material theme in `styles.css`
   - Include Material Icons font in `index.html`

### Getting Help

If you encounter any issues:
1. Check the console for error messages
2. Review the API documentation
3. Check network requests in browser dev tools
4. Create an issue in the repository

## 📞 Support

For questions or support, please contact:
- Email: support@01blog.com
- GitHub Issues: [Create an issue](https://github.com/your-username/01blog/issues)

---

**Happy Blogging! 🎉**