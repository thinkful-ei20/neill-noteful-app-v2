'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();
const knex = require('../knex');

module.exports = router;


// Back in the folders.router.js file create endpoints for the following actions:


// Get All Folders (no search filter needed)
router.get('/', (req, res, next) => {
    knex.select('id', 'name')
        .from('folders')
        .then(results => {
            res.json(results);
        })
        .catch(err => next(err));
});

// Get Folder by id
router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    knex
        .select('id', 'name')
        .from('folders')
        .where('id', id)
        .then(([result]) => {
            res.json(result);
        })
        .catch(err => {
            next(err);
        });
});



// Update Folder The noteful app does not use this endpoint but we'll create it in order to round out our API
router.put('/:id', (req, res, next) => {
    const folderId = req.params.id;

    const { name } = req.body;

    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    const updateItem = {
        name: name
    };

    knex('folders')
        .update(updateItem)
        .where('id', folderId)
        .returning(['id', 'name'])
        .then(([result]) => {
            if (result) {
                res.json(result);
            } else {
                next();
            }
        })
        .catch(err => {
            next(err);
        });
});



// Create a Folder accepts an object with a name and inserts it in the DB.Returns the new item along the new id.
router.post('/', (req, res, next) => {
    const { name } = req.body;

    const newItem = { name };
    if (!newItem.name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    knex
        .insert(newItem)
        .into('folders')
        .returning(['id', 'name'])
        .then(([result]) => {
            res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
        })
        .catch(err => {
            next(err);
        });
});



// Delete Folder By Id accepts an ID and deletes the folder from the DB and then returns a 204 status.
router.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    knex.del()
        .from('folders')
        .where('id', id)
        .then(() => {
            res.status(204).end();
        })
        .catch(err => {
            next(err);
        });
});
