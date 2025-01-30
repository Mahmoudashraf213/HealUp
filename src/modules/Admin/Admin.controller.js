import { User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { roles } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

// get all user
export const getUsers = async (req, res, next) => {
    // get users
    const users = await User.find({ role: roles.USER }).select('-password');
    // check existence
    if (!users.length) {
        return next(new AppError(messages.user.notExist, 404));
    }
    // return users
    return res.status(200).json({
        message: messages.user.fetchedSuccessfully,
        success: true,
        data: users
    })
}

// delete user by id
export const deleteUser = async (req, res, next) => {
    // get user id
    const { userId } = req.params;
    // check existence
    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError(messages.user.notExist, 404));
    }
    if (user.role === roles.ADMIN) {
        return next(new AppError(messages.user.cannotDeletAdmin, 403));
    }
    // delete user
    const userDeleted = await User.findByIdAndDelete(userId)
    // check if user deleted
    if (!userDeleted) {
        return next(new AppError(messages.user.failToDelete, 500));
    }
    // send res 
    return res.status(200).json({
        message: messages.user.deleted,
        success: true
    })
}