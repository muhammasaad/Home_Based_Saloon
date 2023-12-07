const express = require('express')
const router = express.Router()
const userCRUD = require("../Controller/UserController")
const emailSender = require("../Controller/UserEmailController")
const userModel = require("../Model/UserSchemaModel")
const USER = userModel.user;
const jwt = require('jsonwebtoken')


const auth = async (req, res, next) => {
    const fakeToken = req.get('Authorization');
    const token = req.get('Authorization').split('Bearer ')[1];
    console.log(fakeToken)
    console.log(token)
    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY)
        if (verify.id) {
            req.user = await USER.findOne({ _id: verify.id })
            next()
        }
        else {
            res.sendStatus(401)
        }
    } catch (error) {
        res.sendStatus(401)
    }
}


router.
    // post('/signup', userCRUD.SignUP)
    // done
    post('/signup', emailSender.sendEmailUser)
    // done
    .post('/otp-verification', userCRUD.verifyAccountSignup)
    // .post('/sendEmail', emailSender.sendEmail)
    .post('/login', userCRUD.LogIN)
    .get('/get/session', userCRUD.GettingUSERSession)
    .post('/add/fav/services', auth, userCRUD.addFavServices)
    .get('/fetch/fav/services', userCRUD.getFavServices)
    .delete('/delete/fav/services', userCRUD.deleteFavServices)
    .patch('/resetPass', userCRUD.ResetPassUSER)
    .patch('/update/UserDetail', userCRUD.replaceAndUpdateUSER)
    .patch('/update/Password', userCRUD.updatePassUSER)
    .post('/post/address', userCRUD.postAddressUSER)
    .delete('/delete/address', userCRUD.deleteAddressUSER)
    .post('/add/feedback', userCRUD.postFeedbackUSER)
    .delete('/logout', userCRUD.logOUT)
    .delete('/deleteUser', userCRUD.deleteUSER);


exports.router = router
