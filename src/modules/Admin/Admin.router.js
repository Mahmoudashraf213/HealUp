import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { deleteUser, getUsers } from "./Admin.controller.js";
import { isValid } from "../../middleware/validation.js";
import { deleteUserVal } from "./Admin.validation.js";


const adminRouter = Router();

// get all user 
adminRouter.get('/users',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getUsers)
)

// delete user 
adminRouter.delete('/users/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(deleteUserVal),
    asyncHandler(deleteUser)
)

export default adminRouter;