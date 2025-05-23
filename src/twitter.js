const { body } = require('express-validator');
const CrudController = require('./crudController');
const database = require('./database');

class TwitterController extends CrudController {
  constructor() {
    super('hashtags', 'twitter');
    this.collectionName = 'hashtags'; // Uses different database
    this.dbName = 'twitter';
  }

  getCollection() {
    // Override to use twitter database instead of crm
    const db = database.client.db(this.dbName);
    return db.collection(this.collectionName);
  }

  validateBody() {
    return [
      body('hashtag').optional().isString().trim().isLength({ min: 1, max: 100 }),
      body('count').optional().isInt({ min: 0 }),
      body('sentiment').optional().isString().trim().isIn(['positive', 'negative', 'neutral']),
      body('timestamp').optional().isISO8601().toDate(),
      body().custom((value) => {
        const allowedFields = ['hashtag', 'count', 'sentiment', 'timestamp'];
        const extraFields = Object.keys(value).filter(key => !allowedFields.includes(key));
        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }
        return true;
      })
    ];
  }

  async getAll(req, res) {
    try {
      const collection = this.getCollection();
      const { limit = 50, skip = 0, ...filters } = req.query;
      
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
      const collection = this.getCollection();
      
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
          hashtag: document
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new TwitterController().getRouter();
