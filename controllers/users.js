const User = require('../models/user');
const Notification = require('../models/notifications');
const Campground = require('../models/campground');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


module.exports.index = async (req, res) => {
    const users = await User.find({});
    res.render('user/index', { users })
}

module.exports.registerForm = (req, res) => {
    res.render('user/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password, firstName, lastName, bio } = req.body;
        const user = new User({ email, username, firstName, lastName, bio });
        user.avatar.url = req.file.path;
        user.avatar.filename = req.file.filename;
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err)
        });
        req.flash('success', `Hi ${registeredUser.firstName}!! Nice to meet you!! Welcome to YelpCamp`);
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
};

module.exports.loginForm = (req, res) => {
    res.render('user/login');
}

module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome Back!');
    const user = await User.findOne({ username: req.session.passport.user });
    await User.findByIdAndUpdate(user._id, { currentlyActive: true })
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl)
};

module.exports.logout = async (req, res) => {
    const user = await User.findOne({ username: req.session.passport.user });
    await User.findByIdAndUpdate(user._id, { currentlyActive: false });
    // formatDate(user.lastActive);
    // console.log(Date.now().getTime(),user.lastActive.getTime());
    await User.findByIdAndUpdate(user._id, { lastActive: Date.now() })
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds')
};

module.exports.resetForm = (req, res) => {
    res.render('user/reset')
}

module.exports.reset = (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/reset');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'bookworms0118@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'bookworms0118@gmail.com',
                subject: 'YelpCamp Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/reset');
    });
}

module.exports.changeForm = (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/reset');
        }
        res.render('user/change', { token: req.params.token });
    });
}

module.exports.change = (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    console.log('BYEEE')
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'bookworms0118@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'bookworms0118@mail.com',
                subject: 'YelpCamp Password Changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/campgrounds');
    });
}

module.exports.profile = async (req, res) => {
    const user = await User.findById(req.params.id).populate('followers');
    let campgrounds = await Campground.find({ author: req.params.id })
    if (!user) {
        req.flash('error', 'Sorry! No profile found!');
        const redirectUrl = req.session.returnTo || '/campgrounds';
        delete req.session.returnTo;
        res.redirect(redirectUrl)
    }
    res.render('user/show', { user, campgrounds })
}

module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted user!');
    res.redirect('/users');
}

module.exports.followUser = async (req, res) => {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/users/' + req.params.id);
};

// view all notifications
module.exports.viewNotifications = async (req, res) => {
    try {
        let user = await User.findById(req.user._id).populate({
            path: 'notifications',
            options: { sort: { "_id": -1 } }
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
};

// handle notification
module.exports.notifications =  async function (req, res) {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`);
};
