const { body } = require('express-validator');
const CrudController = require('./crudController');

class DirectorsController extends CrudController {
  constructor() {
    super('director', 'directors');
  }

  validateBody() {
    return [
      body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
      body('nationality').optional().isString().trim().isLength({ min: 1, max: 50 }),
      body('birthYear').optional().isInt({ min: 1850, max: new Date().getFullYear() }),
      body('awards').optional().isArray(),
      body('movies').optional().isArray(),
      body().custom((value) => {
        const allowedFields = ['name', 'nationality', 'birthYear', 'awards', 'movies'];
        const extraFields = Object.keys(value).filter(key => !allowedFields.includes(key));
        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }
        return true;
      })
    ];
  }
}

module.exports = new DirectorsController().getRouter();
