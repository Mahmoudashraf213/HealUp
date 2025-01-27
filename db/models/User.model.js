import { model, Schema } from "mongoose";
import { roles } from "../../src/utils/constant/enums.js";

// schema
const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.USER
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpiresAt: Date
}, { timestamps: true })

// model 
export const User = model("User", userSchema);