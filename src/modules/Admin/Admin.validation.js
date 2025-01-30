// module
import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// deleteUserVal
export const deleteUserVal = joi.object({
    userId: generalFields.objectId.required()
})