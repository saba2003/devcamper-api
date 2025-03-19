# DevCamper API

The **DevCamper API** is a full-featured backend solution for a bootcamp directory application. It allows users to manage bootcamps, courses, authentication, and reviews using a RESTful API. Built with Node.js, Express, and MongoDB, it includes robust authentication, middleware for security, and API documentation.

---

## Features

### Bootcamp Management
- CRUD operations for bootcamps (create, read, update, delete)
- Geolocation support for bootcamp locations
- Bootcamp photo upload functionality

### Course Management
- CRUD operations for courses linked to bootcamps
- Automatic calculation of average course cost
- Filtering, sorting, and pagination support

### User Authentication & Authorization
- **JWT Authentication**: Secure login and token-based authentication
- **Role-based Access Control**: Restrict access to certain endpoints (e.g., only publishers can manage bootcamps)
- **User Registration & Login**: Secure sign-up and login with encrypted passwords
- **Password Reset**: Reset password functionality with email verification

### Reviews & Ratings
- Users can add, update, or delete reviews for bootcamps
- Average ratings calculation for bootcamps

---

## Middleware Implementations

### Error Handling
- Centralized error handling for consistent API responses
- Custom error responses for invalid requests

### Security Enhancements
- **Data Sanitization**: Prevent NoSQL injection and XSS attacks
- **Rate Limiting**: Restrict excessive API requests
- **CORS**: Allows cross-origin requests
- **Helmet**: Sets security-related HTTP headers

### Authentication Middleware
- Protects private routes by verifying JWT tokens
- Ensures only authenticated users can access specific endpoints

### Authorization Middleware
- Restricts access based on user roles (admin, publisher, user)
- Only bootcamp owners or admins can modify/delete bootcamps

---

## Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB database setup (local or cloud)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/saba2003/devcamper-api.git
