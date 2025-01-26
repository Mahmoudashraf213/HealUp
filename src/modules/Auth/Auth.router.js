import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { loginVal, signupVal } from "./Auth.validation.js";
import { login, signup, verifyAccount } from "./Auth.controller.js";


const authRouter = Router()

// sign up 
authRouter.post('/signup',
    isValid(signupVal),
    asyncHandler(signup)
)

// verify account
authRouter.get('/verify/:token',
    asyncHandler(verifyAccount)
)
// login 
authRouter.post('/login',
    isValid(loginVal),
    asyncHandler(login)
)

export default authRouter;