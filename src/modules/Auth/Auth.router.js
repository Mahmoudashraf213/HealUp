import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { forgetPasswordVal, loginVal, resetPasswordVal, signupVal } from "./Auth.validation.js";
import { forgetPassword, getProfile, login, resetPassword, signup, verifyAccount } from "./Auth.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";


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

// get profile
authRouter.get('/profile',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.USER]),
    asyncHandler(getProfile)
)

// forget password
authRouter.post('/forget-password',
    isValid(forgetPasswordVal),
    asyncHandler(forgetPassword)
)

// reset password
authRouter.post('/reset-password',
    isValid(resetPasswordVal),
    asyncHandler(resetPassword)
)

export default authRouter;