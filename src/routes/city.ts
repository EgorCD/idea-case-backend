import express, { Request, Response } from 'express';
import db_knex from '../db/index_knex.js';
import {
  dbErrorHandler,
  requestErrorHandler,
  successHandler,
} from '../responseHandler/index.js';

const city = express.Router();

// Get all cities
city.get('/', (req: Request, res: Response) => {
  db_knex('City')
    .select('id', 'name', 'established', 'averageTemp')
    .orderBy('name', 'asc')
    .then((data) => {
      successHandler(req, res, data, 'Get all cities successful');
    })
    .catch((err) => {
      requestErrorHandler(req, res, `${err} Oops! Nothing came through - City`);
    });
});

// Get city by id
city.get('/:id', (req: Request, res: Response) => {
  db_knex('City')
    .select()
    .where('id', req.params.id)
    .then((data) => {
      if (data.length === 1) {
        successHandler(
          req,
          res,
          data,
          `City fetched successfully with id ${req.params.id}`,
        );
      } else {
        requestErrorHandler(req, res, `Non-existing city id: ${req.params.id}`);
      }
    })
    .catch((err) => {
      dbErrorHandler(req, res, err, 'Oops! Nothing came through - City');
    });
});

// Add a new city
city.post('/', (req: Request, res: Response) => {
  db_knex
    .insert(req.body)
    .into('City')
    .then((idArray) => {
      successHandler(req, res, idArray, 'City added successfully.');
    })
    .catch((error) => {
      if (error.errno === 1062) {
        requestErrorHandler(
          req,
          res,
          `Conflict: City with the name ${req.body.name} already exists!`,
        );
      } else {
        dbErrorHandler(req, res, error, 'Error adding city');
      }
    });
});

// Update a city
city.put('/:id', (req: Request, res: Response) => {
  db_knex('City')
    .where('id', req.params.id)
    .update(req.body)
    .then((rowsAffected) => {
      if (rowsAffected === 1) {
        successHandler(req, res, rowsAffected, 'City updated successfully');
      } else {
        requestErrorHandler(req, res, 'Error updating city');
      }
    })
    .catch((error) => {
      dbErrorHandler(req, res, error, 'Error updating city');
    });
});

// Delete a city
city.delete('/:id', (req: Request, res: Response) => {
  db_knex('City')
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
      dbErrorHandler(req, res, error, 'Error deleting city');
    });
});

export default city;
