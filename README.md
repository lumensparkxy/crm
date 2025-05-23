# CRM REST API

A refactored and secure Node.js REST API for Customer Relationship Management with support for customers, albums, directors, singers, and Twitter hashtag data. Version 2.0.0.

## Features

- **Security First**: Input validation, NoSQL injection prevention, rate limiting, security headers
- **Modern Architecture**: ES6+, async/await, centralized error handling, shared database connections
- **Validation**: Comprehensive input validation and sanitization for all endpoints
- **Standardized Responses**: Consistent JSON response format across all APIs
- **Environment Configuration**: Configurable via environment variables
- **Structured Logging**: Consistent logging format with configurable log levels

## Security Improvements

- Input validation and sanitization using `express-validator`
- NoSQL injection prevention through query sanitization
- Rate limiting (configurable requests per 15 minutes per IP via RATE_LIMIT_MAX, default: 100)
- Security headers via `helmet`
- CORS protection with configurable allowed origins
- Centralized error handling to prevent information leakage
- Structured logging with configurable verbosity

## API Endpoints

### Health Checks
- `GET /` - API information and version
- `GET /ping` - Server health check

### Customers (`/customers`)
- `GET /customers` - List customers with pagination
- `POST /customers` - Create new customer
- `DELETE /customers/:id` - Delete customer by ID
- `POST /customers/customers` - Legacy create endpoint
- `DELETE /customers/customers` - Legacy delete by query

### Albums (`/albums`)
- `GET /albums` - List albums with pagination  
- `POST /albums` - Create new album
- `DELETE /albums/:id` - Delete album by ID

### Directors (`/directors`)
- `GET /directors` - List directors with pagination
- `POST /directors` - Create new director  
- `DELETE /directors/:id` - Delete director by ID

### Singers (`/singers`)
- `GET /singers` - List singers with pagination
- `POST /singers` - Create new singer
- `DELETE /singers/:id` - Delete singer by ID

### Twitter (`/twitter`)
- `GET /twitter` - List hashtag data with pagination
- `POST /twitter` - Create new hashtag entry
- `DELETE /twitter/:id` - Delete hashtag entry by ID

Note: Twitter data is stored in a separate 'twitter' database, not in the main 'crm' database.

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `MONGODB_URI` - MongoDB connection string (default: mongodb://twitterx.organic-farmer.in:27017)
- `DB_NAME` - Database name (default: crm)  
- `PORT` - Server port (default: 8080)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated list)
- `RATE_LIMIT_MAX` - Rate limit per 15 minutes (default: 100)
- `LOG_LEVEL` - Logging verbosity (ERROR, WARN, INFO, DEBUG, default: INFO)

## Running

```bash
node server.js
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "data": {
    "resource_name": [...],
    "pagination": {
      "total": 100,
      "limit": 50, 
      "skip": 0,
      "count": 50
    }
  },
  "message": "Error message if success=false",
  "errors": [
    {
      "param": "fieldName",
      "msg": "Error description",
      "location": "body|query|param"
    }
  ]
}
```

For successful create operations, the response includes the inserted ID and document:

```json
{
  "success": true,
  "data": {
    "inserted_id": "60d21b4667d0d8992e610c85",
    "resource_name": {...}
  }
}
```

## Input Validation

All POST endpoints validate input data:
- **Customers**: name (string, 1-100 chars), email (valid format), phone (string), address (string)
- **Albums**: title (string, 1-200 chars), artist (string, 1-100 chars), year (integer, 1900-current), genre (string), tracks (array)
- **Directors**: name (string, 1-100 chars), nationality (string, 1-50 chars), birthYear (integer, 1850-current), awards (array), movies (array)
- **Singers**: name (string, 1-100 chars), genre (string, 1-50 chars), albums (array), birthYear (integer, 1850-current), country (string, 1-50 chars)
- **Twitter**: hashtag (string, 1-100 chars), count (integer, min 0), sentiment ('positive', 'negative', 'neutral'), timestamp (ISO 8601)

All endpoints use:
- Validation with descriptive error messages
- Field filtering to prevent unexpected data
- Query parameter validation for pagination (limit, skip)
- MongoDB ID validation for ID parameters

## Architecture

- `src/database.js` - Shared MongoDB connection with pooling
- `src/crudController.js` - Generic CRUD base class
- `src/logger.js` - Centralized logging service with customizable levels
- `src/*.js` - Resource-specific controllers extending CrudController
- `server.js` - Express app with security middleware and route configuration
