const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userScema = new Schema({
    id: Schema.Types.ObjectId,
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
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
    Home_Address: [String],
    Work_Address: [String],
    feedback: [{
        option: String,
        message: String,
    }],
    OTP: {
        type: Number,
        expires: '30s',
    },
    favoriteServices: [String],
    password: { type: String, minLength: 4, required: true },
    country: String,
    phoneNumber: { type: String },
    wallet: Number,
    isVerified: { type: Boolean, default: false },
    tokenVersion: { type: String }
},
    { timestamps: true }
)

exports.user = mongoose.model("User", userScema)
