// modules
import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// signupVal
export const signupVal = joi.object({
    name: generalFields.name.required(),
    email: generalFields.email.required(),
    phoneNumber: generalFields.phoneNumber.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required()
})

// loginVal 
export const loginVal = joi.object({
    email: generalFields.email.required(),
    phoneNumber: generalFields.phoneNumber.required(),
    password: generalFields.password.required()
})