import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const addOrderVal = joi.object({
    customer : generalFields.customer,
    medicines : generalFields.medicines.required(),
    totalPrice : generalFields.totalPrice,
    status : generalFields.status,
    paymentMethod : generalFields.paymentMethod.required(),
    isPaid : generalFields.isPaid,
    shippingAddress : generalFields.shippingAddress.required(),
    // createdBy : generalFields.createdBy
})