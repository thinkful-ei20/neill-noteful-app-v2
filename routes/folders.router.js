'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();
const knex = require('../knex');

module.exports = router;


// Back in the folders.router.js file create endpoints for the following actions:


// Get All Folders (no search filter needed)
router.get('/folders', (req, res, next) => {
    knex.select('id', 'name')
        .from('folders')
        .then(results => {
            res.json(results);
        })
        .catch(err => next(err));
});

// Get Folder by id



// Update Folder The noteful app does not use this endpoint but we'll create it in order to round out our API



// Create a Folder accepts an object with a name and inserts it in the DB.Returns the new item along the new id.



// Delete Folder By Id accepts an ID and deletes the folder from the DB and then returns a 204 status.
