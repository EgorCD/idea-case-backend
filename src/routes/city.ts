import express, { Request, Response } from 'express';
import { admin } from '../authorization/admin.js';
import { planner } from '../authorization/planner.js';
import { roleChecker } from '../authorization/roleChecker.js';
import { statist } from '../authorization/statist.js';
import { authenticator } from '../authorization/userValidation.js';
import db_knex from '../db/index_knex.js';
import {
  dbErrorHandler,
  requestErrorHandler,
  successHandler,
} from '../responseHandler/index.js';
import {
  validateCityId,
  validateCityPost,
  validateCityPut,
} from '../validationHandler/city.js';
import { validate, validateIdObl } from '../validationHandler/index.js';

const city = express.Router();

// get all cities
city.get(
  '/',
  [authenticator, admin, planner, statist, roleChecker],
  (req: Request, res: Response) => {
    db_knex('City')
      .select('id', 'name', 'established', 'averageTemp')
      .orderBy('name', 'asc')
      .then((data) => {
        successHandler(req, res, data, 'Get all cities successful');
      })
      .catch((err) => {
        requestErrorHandler(
          req,
          res,
          `${err} Oops! Nothing came through - City`,
        );
      });
  },
);

// get city by id
city.get(
  '/:id',
  validateIdObl,
  [authenticator, admin, planner, statist, roleChecker, validate],
  (req: Request, res: Response) => {
    db_knex('City')
      .select()
      .where('id', req.params.id)
      .then((data) => {
        successHandler(
          req,
          res,
          data,
          'Successfully read the city by id from database',
        );
      })
      .catch((err) => {
        dbErrorHandler(
          req,
          res,
          err,
          'Oh no! Could not get anything from database',
        );
      });
  },
);

// add city
city.post(
  '/',
  validateCityPost,
  [authenticator, admin, roleChecker, validate],
  (req: Request, res: Response) => {
    db_knex('City')
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
  },
);

// update city
city.put(
  '/:id',
  validateCityPut,
  [authenticator, admin, roleChecker, validate],
  (req: Request, res: Response) => {
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
  },
);

// delete city by id
city.delete(
  '/:id',
  validateIdObl,
  [authenticator, admin, roleChecker, validate],
  (req: Request, res: Response) => {
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
  },
);

export default city;
