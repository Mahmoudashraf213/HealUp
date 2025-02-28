import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const addToCartVal = joi.object ({
    medicineId: generalFields.objectId.required(),
    quantity: generalFields.quantity.required(),
})

export const deleteFromCartVal = joi.object ({
    medicineId: generalFields.objectId.required(),
})

