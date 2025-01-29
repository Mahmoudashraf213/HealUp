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
})

export const updateOrderVal = joi.object({
    medicines : generalFields.medicines,
    totalPrice : generalFields.totalPrice,
    status : generalFields.status,
    paymentMethod : generalFields.paymentMethod,
    isPaid : generalFields.isPaid,
    shippingAddress : generalFields.shippingAddress,
    orderId : generalFields.objectId,

})

export const getOrderVal = joi.object({
    orderId : generalFields.objectId.required(),
})