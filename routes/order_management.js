const express = require('express')
const router = express.Router()
const order = require('../Controller/OrderController')

router.
    post('/place/order', order.buyService)
    .patch('/update/order', order.updateStatusService)
    .get('/get/order', order.getBookedSlots)

exports.router = router