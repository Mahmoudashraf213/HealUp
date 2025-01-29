import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { roles } from "../../utils/constant/enums.js";
import { addOrder } from "./Order.controller.js";
import { addOrderVal } from "./Order.validation.js";


const OrderRouter = Router();

// add order
OrderRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.USER]),
    isValid(addOrderVal),
    asyncHandler(addOrder)
)


export default OrderRouter;