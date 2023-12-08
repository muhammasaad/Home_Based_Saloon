const express = require('express')
const router = express.Router()
const userCRUD = require("../Controller/UserController")
const emailSender = require("../Controller/UserEmailController")
const userModel = require("../Model/UserSchemaModel")
const USER = userModel.user;
const ResponseHanding = require('../ResponseHandling');
const jwt = require('jsonwebtoken')


const auth = async (req, res, next) => {
    const token = req.get('Authorization').split('Bearer ')[1];
    console.log(token)
    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY)
        if (verify.id) {
            console.log(token)
            const user = await USER.findOne({ _id: verify.id })
            if (user.tokenVersion === verify.tokenVersion) {
                next();
            } else {
                new ResponseHanding(res, 401, "Token Expired ");
            }
        }
        else {
            new ResponseHanding(res, 401, "Unauthorized ");
        }
    } catch (error) {
        new ResponseHanding(res, 401, "Unauthorized ");
    }
}


router.
    // done
    post('/signup', emailSender.sendEmailUser)
    // done
    .post('/otp-verification', userCRUD.verifyAccountSignup)
    // done
    .post('/login', userCRUD.LogIN)
    // done
    .get('/get', auth, userCRUD.gettingUSER)

// Forget-Password 
.post('/forgetPassword', emailSender.sendEmailUserPasswordOTP)
.post('/forgetPasswordOtp', userCRUD.forgetPassOTP)
.patch('/newPassword', userCRUD.ResetPassUSER)


.patch('/updatePassword', auth,userCRUD.changePassword)


.patch('/updateUserDetail', auth, userCRUD.replaceAndUpdateUSER)



    .get('/get/session', userCRUD.GettingUSERSession)
    .post('/add/fav/services', auth, userCRUD.addFavServices)
    .get('/fetch/fav/services', userCRUD.getFavServices)
    .delete('/delete/fav/services', userCRUD.deleteFavServices)
    .post('/post/address', userCRUD.postAddressUSER)
    .delete('/delete/address', userCRUD.deleteAddressUSER)
    .post('/add/feedback', userCRUD.postFeedbackUSER)
    .delete('/logout', userCRUD.logOUT)
    .delete('/deleteUser', userCRUD.deleteUSER);


exports.router = router
