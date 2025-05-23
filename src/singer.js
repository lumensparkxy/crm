const { body } = require('express-validator');
const CrudController = require('./crudController');

class SingersController extends CrudController {
  constructor() {
    super('singer', 'singers');
  }

  validateBody() {
    return [
      body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
      body('genre').optional().isString().trim().isLength({ min: 1, max: 50 }),
      body('albums').optional().isArray(),
      body('birthYear').optional().isInt({ min: 1850, max: new Date().getFullYear() }),
      body('country').optional().isString().trim().isLength({ min: 1, max: 50 }),
      body().custom((value) => {
        const allowedFields = ['name', 'genre', 'albums', 'birthYear', 'country'];
        const extraFields = Object.keys(value).filter(key => !allowedFields.includes(key));
        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }
        return true;
      })
    ];
  }
}

module.exports = new SingersController().getRouter();
