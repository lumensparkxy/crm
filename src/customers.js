const { body } = require('express-validator');
const CrudController = require('./crudController');
const database = require('./database');

class CustomersController extends CrudController {
  constructor() {
    super('customer', 'customers');
    this.setupCustomRoutes();
  }

  setupCustomRoutes() {
    // Legacy routes for backward compatibility
    this.router.post('/customers', 
      this.validateBody(),
      this.handleValidationErrors,
      this.create.bind(this)
    );

    this.router.delete('/customers', 
      this.handleValidationErrors,
      this.deleteByQuery.bind(this)
    );
  }

  validateBody() {
    return [
      body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
      body('email').optional().isEmail().normalizeEmail(),
      body('phone').optional().isString().trim(),
      body('address').optional().isString().trim(),
      body().custom((value) => {
        const allowedFields = ['name', 'email', 'phone', 'address'];
        const extraFields = Object.keys(value).filter(key => !allowedFields.includes(key));
        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }
        return true;
      })
    ];
  }

  async deleteByQuery(req, res) {
    try {
      const collection = database.getCollection(this.collectionName);
      const sanitizedQuery = this.sanitizeFilters(req.query);
      
      if (Object.keys(sanitizedQuery).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Delete query cannot be empty'
        });
      }

      const result = await collection.deleteOne(sanitizedQuery);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
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
}

module.exports = new CustomersController().getRouter();
