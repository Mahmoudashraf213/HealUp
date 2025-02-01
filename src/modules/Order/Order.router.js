import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { roles } from "../../utils/constant/enums.js";
import { addOrder, deleteOrder, getAllOrders, getOrder, updateOrder } from "./Order.controller.js";
import { addOrderVal, deleteOrderVal, getOrderVal, updateOrderVal } from "./Order.validation.js";


const OrderRouter = Router();

// add order
OrderRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(addOrderVal),
    asyncHandler(addOrder)
)

// update order
OrderRouter.put('/:orderId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(updateOrderVal),
    asyncHandler(updateOrder)
)

// get specific order
OrderRouter.get('/:orderId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(getOrderVal),
    asyncHandler(getOrder)
)


// get all orders
OrderRouter.get('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    // isValid(getAllOrdersVal),
    asyncHandler(getAllOrders)
)

// delete order by id
OrderRouter.delete('/:orderId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(deleteOrderVal),
    asyncHandler(deleteOrder)
)
export default OrderRouter;