const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds')
const { campgroundSchema } = require('../schema.js');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })
const { isLoggedIn, isAuthor, validateCampground, paginateResults } = require('../middleware')

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

router.route('/')
    .get(paginateResults(Campground),catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.newForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm))

module.exports = router;