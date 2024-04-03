const mongoose = require("mongoose");
const { Schema } = require("mongoose");


const providerSchema = new Schema({
    id: Schema.Types.ObjectId,
    profilepic: { type: String },
    shortcode: { type: String, unique: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    salonName: { type: String, required: true },
    address: [String],
    services: [{
        provId: Schema.Types.ObjectId,
        title: String,
        description: String,
        price: Number,
        tag: String,
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
    }],
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email required"]
    },
    feedback: [{
        option: String,
        message: String,
    }],
    OTP: {
        type: Number,
    },
    phoneNumber: { type: String },
    wallet: Number,
    tokenVersion: { type: String }
},
    { timestamps: true }
)

exports.provider = mongoose.model("Provider", providerSchema)