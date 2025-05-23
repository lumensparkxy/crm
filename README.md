# CRM REST API

A refactored and secure Node.js REST API for Customer Relationship Management with support for customers, albums, directors, singers, and Twitter hashtag data.

## Features

- **Security First**: Input validation, NoSQL injection prevention, rate limiting, security headers
- **Modern Architecture**: ES6+, async/await, centralized error handling, shared database connections
- **Validation**: Comprehensive input validation and sanitization for all endpoints
- **Standardized Responses**: Consistent JSON response format across all APIs
- **Environment Configuration**: Configurable via environment variables

## Security Improvements

- Input validation and sanitization using `express-validator`
- NoSQL injection prevention through query sanitization
- Rate limiting (100 requests per 15 minutes per IP)
- Security headers via `helmet`
- CORS protection
- Centralized error handling to prevent information leakage

## API Endpoints

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
- `MONGODB_URI` - MongoDB connection string
- `DB_NAME` - Database name (default: crm)  
- `PORT` - Server port (default: 8080)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `RATE_LIMIT_MAX` - Rate limit per 15 minutes (default: 100)

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
  "errors": [...]
}
```

## Input Validation

All POST endpoints validate input data:
- **Customers**: name, email, phone, address
- **Albums**: title, artist, year, genre, tracks
- **Directors**: name, nationality, birthYear, awards, movies  
- **Singers**: name, genre, albums, birthYear, country
- **Twitter**: hashtag, count, sentiment, timestamp

## Architecture

- `src/database.js` - Shared MongoDB connection with pooling
- `src/crudController.js` - Generic CRUD base class
- `src/*.js` - Resource-specific controllers extending CrudController
- `server.js` - Express app with security middleware
