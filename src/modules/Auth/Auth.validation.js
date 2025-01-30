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
    email: generalFields.email.when('phoneNumber', {
        is: joi.exist(),
        then: joi.optional(),
        otherwise: joi.required()
    }), phoneNumber: generalFields.phoneNumber,
    password: generalFields.password.required()
})

// forgetPasswordVal
export const forgetPasswordVal = joi.object({
    email: generalFields.email.when('phoneNumber', {
        is: joi.exist(),
        then: joi.optional(),
        otherwise: joi.required()
    }), phoneNumber: generalFields.phoneNumber,
})

// rest password
export const resetPasswordVal = joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required()
})