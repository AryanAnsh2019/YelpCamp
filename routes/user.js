const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users')
const multer = require('multer')
const { storage } = require('../cloudinary');
const { isProfileAuthor } = require('../middleware');
const upload = multer({ storage })

router.get('/users', catchAsync(users.index))

router.route('/register')
    .get(users.registerForm)
    .post(upload.single('image'),catchAsync(users.register))

router.route('/login')
    .get(users.loginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(users.login))

router.get('/logout', catchAsync(users.logout))

router.route('/reset')
    .get(users.resetForm)
    .post(users.reset)

router.route('/reset/:token')
    .get(users.changeForm)
    .post(users.change)

router.route('/users/:id')
    .get(users.profile)
    .delete(isProfileAuthor, catchAsync(users.deleteUser))

module.exports = router;