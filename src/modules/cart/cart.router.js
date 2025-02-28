import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addToCart, deleteFromCart, getCart } from "./cart.controller.js";
import { addToCartVal, deleteFromCartVal } from "./cart.validation.js";
import { roles } from "../../utils/constant/enums.js";

const CartRouter = Router();
// add to cart route
CartRouter.post("/add",
     isAuthenticated(),
     isAuthorized([roles.ADMIN, roles.USER]),
     isValid(addToCartVal),
     asyncHandler(addToCart)
)

// get cart 
CartRouter.get("/",
     isAuthenticated(),
     isAuthorized([roles.ADMIN, roles.USER]),
     asyncHandler(getCart)
)

// delete from cart
 CartRouter.delete("/:medicineId",
        isAuthenticated(),
        isAuthorized([roles.ADMIN, roles.USER]),
        isValid(deleteFromCartVal),
        asyncHandler(deleteFromCart)
 )

export default CartRouter 