const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('./database');

class CrudController {
  constructor(collectionName, resourceName) {
    this.collectionName = collectionName;
    this.resourceName = resourceName;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get all items with query filtering
    this.router.get('/', 
      this.validateQuery(),
      this.handleValidationErrors,
      this.getAll.bind(this)
    );

    // Create new item
    this.router.post('/', 
      this.validateBody(),
      this.handleValidationErrors,
      this.create.bind(this)
    );

    // Delete item by ID
    this.router.delete('/:id', 
      this.validateId(),
      this.handleValidationErrors,
      this.deleteById.bind(this)
    );
  }

  validateQuery() {
    return [
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('skip').optional().isInt({ min: 0 }).toInt(),
    ];
  }

  validateBody() {
    // Override in subclasses for specific validation
    return [
      body().isObject().withMessage('Request body must be a valid object'),
    ];
  }

  validateId() {
    return [
      param('id').isMongoId().withMessage('Invalid ID format'),
    ];
  }

  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }

  async getAll(req, res) {
    try {
      const collection = database.getCollection(this.collectionName);
      const { limit = 50, skip = 0, ...filters } = req.query;
      
      // Sanitize filters to prevent NoSQL injection
      const sanitizedFilters = this.sanitizeFilters(filters);
      
      const documents = await collection
        .find(sanitizedFilters)
        .limit(limit)
        .skip(skip)
        .toArray();

      const total = await collection.countDocuments(sanitizedFilters);

      res.json({
        success: true,
        data: {
          [this.resourceName]: documents,
          pagination: {
            total,
            limit,
            skip,
            count: documents.length
          }
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req, res) {
    try {
      const collection = database.getCollection(this.collectionName);
      
      const document = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(document);

      res.status(201).json({
        success: true,
        data: {
          inserted_id: result.insertedId,
          [this.resourceName.slice(0, -1)]: document
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteById(req, res) {
    try {
      const collection = database.getCollection(this.collectionName);
      const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: `${this.resourceName.slice(0, -1)} not found`
        });
      }

      res.json({
        success: true,
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  sanitizeFilters(filters) {
    const sanitized = {};
    for (const [key, value] of Object.entries(filters)) {
      // Prevent NoSQL injection by only allowing safe operations
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  handleError(res, error) {
    console.error(`${this.resourceName} error:`, error);
    
    if (error.name === 'MongoError' || error.name === 'BSONTypeError') {
      return res.status(400).json({
        success: false,
        message: 'Database operation failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }

  getRouter() {
    return this.router;
  }
}

module.exports = CrudController;