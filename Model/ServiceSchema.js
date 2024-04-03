const mongoose = require("mongoose");
const { Schema } = require("mongoose");


const serviceSchema = new Schema({
    provId: Schema.Types.ObjectId,
    title: String,
    description: String,
    price: Number,
    tag: [String],
    category: String,
    images: [String],
    ratings: { type: Number, default: 0 },
    reviews: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            name: {
                type: String,
            },
            rating: {
                type: Number,
            },
            comment: {
                type: String,
            }
        }
    ],
    isFeatured: { type: Boolean, default: false},
    // duration:  ,
    // timeSlot: ,
},
    { timestamps: true }
)

exports.service = mongoose.model("Service", serviceSchema)