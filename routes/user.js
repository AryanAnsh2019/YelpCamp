const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users')
const multer = require('multer')
const { storage } = require('../cloudinary');
const { isProfileAuthor, isLoggedIn, } = require('../middleware');
const upload = multer({ storage })
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


router.get('/users', catchAsync(users.index))

router.route('/register')
    .get(users.registerForm)
    .post(upload.single('image'), catchAsync(users.register))

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

router.get('/follow/:id', isLoggedIn, catchAsync(users.followUser))

router.get('/notifications', isLoggedIn, catchAsync(users.viewNotifications))
router.get('/notifications/:id', isLoggedIn, catchAsync(users.notifications))

router.get('/checkout', isLoggedIn, async (req, res) => {
    res.render('checkout', { amount: 1099 });
});


router.post('/pay', isLoggedIn, async (req, res) => {
    const { paymentMethodId, items, currency } = req.body;

    const orderAmount = 1099;

    try {
        // Create new PaymentIntent with a PaymentMethod ID from the client.
        const intent = await stripe.paymentIntents.create({
            amount: orderAmount,
            currency: currency,
            payment_method: paymentMethodId,
            error_on_requires_action: true,
            confirm: true
        });

        console.log("💰 Payment received!");
        // The payment is complete and the money has been moved
        // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

        req.user.isPaid=true;
        await req.user.save();
        // Send the client secret to the client to use in the demo
        res.send({ clientSecret: intent.client_secret });
    } catch (e) {
        // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
        // See https://stripe.com/docs/declines/codes for more
        if (e.code === "authentication_required") {
            res.send({
                error:
                    "This card requires authentication in order to proceeded. Please use a different card."
            });
        } else {
            res.send({ error: e.message });
        }
    }
})

module.exports = router;