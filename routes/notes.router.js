'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();
const knex = require('../knex');


// Get All (and search by query)
router.get('/', (req, res, next) => {
    const { searchTerm, folderId } = req.query;

    knex
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .modify(queryBuilder => {
            if (searchTerm) {
                queryBuilder.where('title', 'like', `%${searchTerm}%`);
            }
        })
        .modify(function(queryBuilder) {
            if (folderId) {
                queryBuilder.where('folder_id', folderId);
            }
        })
        .orderBy('notes.id')
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            next(err);
        });
});



// Get a single item
router.get('/:id', (req, res, next) => {
    const id = req.params.id; 

    knex('notes')
        .select(
            'notes.id',
            'title',
            'content',
            'folders.id as folderId',
            'folders.name as folderName'
        )
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id)
        .first()
        .then(result => {
            if (result) res.json(result);
            else next();
        })
        .catch(next);
});



// Put update an item
router.put('/:id', (req, res, next) => {
    const id = req.params.id;

    const { title, content, folderId } = req.body; 

    const updateItem = {
        title,
        content,
        folder_id: folderId ? folderId : null
    };

    /***** Never trust users - validate input *****/
    if (!updateItem.title) {
        const err = new Error('Missing `title` in request body');
        err.status = 400;
        return next(err);
    }

    knex('notes')
        .update(updateItem)
        .where('id', id)
        .then(() => {
            return knex('notes')
                .select(
                    'notes.id',
                    'title',
                    'content',
                    'folder_id',
                    'folders.name as folder_name'
                )
                .leftJoin('folders', 'notes.folder_id', 'folders.id')
                .where('notes.id', id);
        })
        .then(([result]) => {
            if (result) res.json(result);
            else next();
        })
        .catch(next);
});

// Post (insert) an item
router.post('/', (req, res, next) => {
    const { title, content, folderId } = req.body; // Add `folder_id` to object destructure

    const newItem = { 
        title, 
        content, 
        folder_id: folderId ? folderId : null
    };

    /***** Never trust users - validate input *****/
    if (!newItem.title) {
        const err = new Error('Missing `title` in request body');
        err.status = 400;
        return next(err);
    }
    let noteId;

    knex('notes')
        .insert(newItem) // Insert new note, instead of returning all the fields, just return the new `id`
        .returning('id')
        .then(([id]) => {
            noteId = id;
            return knex('notes') // Using the new id, select the new note and the folder
                .select(
                    'notes.id',
                    'title',
                    'content',
                    'folder_id as folderId',
                    'folders.name as folder_name'
                )
                .leftJoin('folders', 'notes.folder_id', 'folders.id')
                .where('notes.id', noteId);
        })
        .then(([result]) => {
            
            res
                .location(`${req.originalUrl}/${result.id}`)
                .status(201)
                .json(result);
        })
        .catch(next);
});



// Delete an item
router.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    knex('notes')
        .where('id', id)
        .del()
        .then(() => res.sendStatus(204))
        .catch(next);
});


module.exports = router;