// import modules
import joi from 'joi';
import { AppError } from '../utils/appError.js';


export const generalFields = {
    name: joi.string(),
    brand: joi.string(),
    category: joi.string(),
    price: joi.number().positive(),
    stock: joi.number().integer().min(0),
    expiryDate: joi.date().greater("now"),
    manufacturer: joi.string().pattern(new RegExp(/^[a-fA-F0-9]{24}$/)),
    batchNumber: joi.string(),
    dosage: joi.string(),
    prescriptionRequired: joi.boolean(),
    phoneNumber: joi.string().pattern(new RegExp(/^01[0-2,5]{1}[0-9]{8}$/)),
    password: joi.string().pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)),
    confirmPassword: joi.string().valid(joi.ref('password')),
    email: joi.string().email(),
}




export const isValid = (schema) => {
    return (req, res, next) => {
        let data = { ...req.body, ...req.params, ...req.query }
        const { error } = schema.validate(data, { abortEarly: false })
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }
        next()
    }
}