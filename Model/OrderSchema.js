const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    serviceId: Schema.Types.ObjectId,
    BookingNumber: String,
    selectedDate: Date,
    selectedSlot: String,
    status: { type: Number, default: 0 }
},
{timestamps: true},
)

exports.order = mongoose.model("Order", orderSchema)
