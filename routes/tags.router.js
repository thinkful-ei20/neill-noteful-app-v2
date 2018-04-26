'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');


/* ========== GET ALL ========== */
router.get('/', (req, res, next) => {
    knex.select('id', 'name')
        .from('tags')
        .then(results => {
            res.json(results);
        })
        .catch(err => next(err));
});


/* ========== GET SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
    knex.first('id', 'name')
        .where('id', req.params.id)
        .from('tags')
        .then(result => {
            if (result) {
                res.json(result);
            } else {
                next();
            }
        })
        .catch(err => next(err));
});


/* ========== PUT / UPDATE ITEM ========== */
router.put('/tags/:id', (req, res, next) => {
    const { name } = req.body;

    /***** Never trust users. Validate input *****/
    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    const updateItem = { name };

    knex('tags')
        .update(updateItem)
        .where('id', req.params.id)
        .returning(['id', 'name'])
        .then(([result]) => {
            if (result) {
                res.json(result);
            } else {
                next(); // fall-through to 404 handler
            }
        })
        .catch(err => next(err));
});

/* ========== POST/CREATE ITEM ========== */
router.post('/', (req, res, next) => {
    const { name } = req.body;

    /***** Never trust users. Validate input *****/
    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    const newItem = { name };

    knex.insert(newItem)
        .into('tags')
        .returning(['id', 'name'])
        .then((results) => {
            const result = results[0];
            res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
        })
        .catch(err => next(err));
});


/* ========== DELETE ITEM ========== */
router.delete('/:id', (req, res, next) => {
    knex.del()
        .where('id', req.params.id)
        .from('tags')
        .then(() => {
            res.status(204).end();

        })
        .catch(err => next(err));
});

module.exports = router;
