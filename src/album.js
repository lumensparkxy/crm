const { body } = require('express-validator');
const CrudController = require('./crudController');

class AlbumsController extends CrudController {
  constructor() {
    super('album', 'albums');
  }

  validateBody() {
    return [
      body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
      body('artist').optional().isString().trim().isLength({ min: 1, max: 100 }),
      body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
      body('genre').optional().isString().trim(),
      body('tracks').optional().isArray(),
      body().custom((value) => {
        const allowedFields = ['title', 'artist', 'year', 'genre', 'tracks'];
        const extraFields = Object.keys(value).filter(key => !allowedFields.includes(key));
        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }
        return true;
      })
    ];
  }
}

module.exports = new AlbumsController().getRouter();
