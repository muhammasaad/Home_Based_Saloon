const express = require('express')
const router = express.Router()
const providerCRUD = require("../Controller/ProviderControl")
const serviceCRUD = require("../Controller/ServiceController")
const providerModel = require("../Model/ProviderSchemaModel")
const PROVIDER = providerModel.provider;
const sendEmailProvider = require("../Controller/UserEmailController")

const auth = async (req, res, next) => {
    const fakeToken = req.get('Authorization');

    if (!fakeToken) {
        // 'Authorization' header is missing
        return res.sendStatus(401);
    }

    const token = fakeToken.split('Bearer ')[1];

    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY);

        if (verify.id) {
            req.prov = await PROVIDER.findOne({ _id: verify.id });
            next();
        } else {
            // 'id' is not present in the token payload
            res.sendStatus(401);
        }
    } catch (error) {
        // JWT verification failed
        res.sendStatus(401);
    }
};

router.
    post('/signup', providerCRUD.SignUP)
    .get('/get', providerCRUD.GettingPROV)
    .post('/sendEmail', sendEmailProvider.sendEmailProvider)
    .post('/login', providerCRUD.LogIN)
    .get('/get/session', providerCRUD.GettingPROVSession)
    .patch('/update/ProvDetail', providerCRUD.replaceAndUpdatePROV)
    .post('/post/address', providerCRUD.postAddressPROV)
    .post('/add/reviews/ratings', serviceCRUD.createServiceReview)
    .delete('/delete/reviews/ratings', serviceCRUD.deleteServiceReview)
    .get('/get/reviews/ratings', serviceCRUD.getonlyServiceRatings)
    .get('/get/ratings', serviceCRUD.getServicesDescendingRatings)
    .delete('/delete/address', providerCRUD.deleteAddressPROV)
    .post('/add/feedback', providerCRUD.postFeedbackPROV)
    .delete('/logout', providerCRUD.logOUT)
    .delete('/deleteProv', providerCRUD.deletePROV)
    .patch('/add/services', serviceCRUD.addServices)
    .patch('/edit/services', serviceCRUD.editServices)
    .get('/get/services', serviceCRUD.getServices)
    .get('/get/only/services', serviceCRUD.getOnlyService)
    .get('/get/category/services', serviceCRUD.getCategoryService)
    .delete('/delete/services', serviceCRUD.deleteServices)


exports.router = router