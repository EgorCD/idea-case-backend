import express, { Request, Response } from 'express';
import db_knex from '../db/index_knex.js';
import {
  dbErrorHandler,
  requestErrorHandler,
  successHandler,
} from '../responseHandler/index.js';

const category = express.Router();

// Get all categories
category.get('/', (req: Request, res: Response) => {
  db_knex('Category')
    .select('id', 'name', 'description', 'budgetLimit', 'isActive')
    .orderBy('name', 'asc')
    .then((data) => {
      successHandler(req, res, data, 'Get all categories successful');
    })
    .catch((err) => {
      requestErrorHandler(
        req,
        res,
        `${err} Oops! Nothing came through - Category`,
      );
    });
});

// Get category by id
category.get('/:id', (req: Request, res: Response) => {
  db_knex('Category')
    .select()
    .where('id', req.params.id)
    .then((data) => {
      if (data.length === 1) {
        successHandler(
          req,
          res,
          data,
          `Category fetched successfully with id ${req.params.id}`,
        );
      } else {
        requestErrorHandler(
          req,
          res,
          `Non-existing category id: ${req.params.id}`,
        );
      }
    })
    .catch((err) => {
      dbErrorHandler(req, res, err, 'Oops! Nothing came through - Category');
    });
});

// Add a new category
category.post('/', (req: Request, res: Response) => {
  db_knex
    .insert(req.body)
    .into('Category')
    .then((idArray) => {
      successHandler(req, res, idArray, 'Category added successfully.');
    })
    .catch((error) => {
      if (error.errno === 1062) {
        requestErrorHandler(
          req,
          res,
          `Conflict: Category with the name ${req.body.name} already exists!`,
        );
      } else {
        dbErrorHandler(req, res, error, 'Error adding category');
      }
    });
});

// Update a category
category.put('/:id', (req: Request, res: Response) => {
  db_knex('Category')
    .where('id', req.params.id)
    .update(req.body)
    .then((rowsAffected) => {
      if (rowsAffected === 1) {
        successHandler(req, res, rowsAffected, 'Category updated successfully');
      } else {
        requestErrorHandler(req, res, 'Error updating category');
      }
    })
    .catch((error) => {
      dbErrorHandler(req, res, error, 'Error updating category');
    });
});

// Delete a category
category.delete('/:id', (req: Request, res: Response) => {
  db_knex('Category')
    .where('id', req.params.id)
    .del()
    .then((rowsAffected) => {
      if (rowsAffected === 1) {
        successHandler(
          req,
          res,
          rowsAffected,
          `Delete successful! Count of deleted rows: ${rowsAffected}`,
        );
      } else {
        requestErrorHandler(req, res, `Invalid id: ${req.params.id}`);
      }
    })
    .catch((error) => {
      dbErrorHandler(req, res, error, 'Error deleting category');
    });
});

export default category;
