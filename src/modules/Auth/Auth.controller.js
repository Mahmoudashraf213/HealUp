import bcrypt from 'bcrypt';
import { Cart, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { genreateToken, verifyToken } from '../../utils/token.js';
import { roles } from '../../utils/constant/enums.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { generateOTP, sendOTP } from '../../utils/OTP.js';

// sign up 
export const signup = async (req, res, next) => {
    // get data from req
    const { name, phoneNumber, password, email } = req.body;
    // check if user already exist -- by phoneNumber
    const userExist = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (userExist) {
        return next(new AppError(messages.user.alreadyExist, 409));
    }
    // hash password 
    const hashedPassword = bcrypt.hashSync(password, 8)

    // creat a new user 
    const user = new User({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
    })
    // save to db 
    const userCreated = await user.save();
    // handel fail 
    if (!userCreated) {
        return next(new AppError(messages.user.failToCreate, 500))
    }
    // genreate token 
    const token = genreateToken({ payload: { email, _id: userCreated._id } })
    // Send OTP via SMS
    // const smsResult = await sendOTP(phoneNumber, otp);
    // if (!smsResult.success) {
    //     return next(new AppError("Failed to send OTP via SMS.", 500));
    // }

    // Send verification email
    await sendEmail({
        to: email,
        subject: "Verify your account",
        html: `<p>Click on the link to verify your account: <a href="${req.protocol}://${req.headers.host}/auth/verify/${token}">Verify Account</a></p>`
    });

    // send res 
    return res.status(201).json({
        message: messages.user.created,
        success: true,
        data: userCreated
    })
}

// verify account
export const verifyAccount = async (req, res, next) => {
    // Get the token from request parameters
    const { token } = req.params;

    // Verify the token and extract payload
    const payload = verifyToken(token);

    // If the token is invalid, return an error
    if (!payload) {
        return next(new AppError(messages.user.invalidToken, 400));
    }

    // Find the user by email and update their status to VERIFIED
    const updatedUser = await User.findOneAndUpdate(
        { email: payload.email, role: roles.USER },
        { isVerified: true },
        { new: true }
    );

    // Check if user was found and updated
    if (!updatedUser) {
        return next(new AppError(messages.user.notExist, 404));
    }
    // create card 
    await Cart.create({ user: payload._id, products: [] })

    // Send success response
    return res.status(200).json({ message: messages.user.verified, success: true });
};

// login 
export const login = async (req, res, next) => {
    // get data from req
    const { phoneNumber, email, password } = req.body
    // check existance by phone number
    const userExist = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    });
    if (!userExist) {
        return next(new AppError(messages.user.invalidCredntiols, 401))
    }
    // check if password is correct 
    const isPasswordCorrect = bcrypt.compareSync(password, userExist.password)
    if (!isPasswordCorrect) {
        return next(new AppError(messages.user.invalidCredntiols, 401))
    }
    // check if user is verified
    if (!userExist.isVerified) {
        return next(new AppError(messages.user.notVerified, 403))
    }
    // genreate token
    const token = genreateToken({ payload: { email: email, _id: userExist._id } })
    // send res 
    return res.status(200).json({
        message: messages.user.loginSuccessfully,
        success: true,
        token: token
    })
}

// get profile 
export const getProfile = async (req, res, next) => {
    // get data from req 
    const user = req.authUser._id
    // check existence
    const userExist = await User.findById(user).select('name email phoneNumber role isVerified');
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 404))
    }
    // send res 
    return res.status(200).json({
        success: true,
        data: userExist
    })
}

// forget password
export const forgetPassword = async (req, res, next) => {
    // get data from req
    const { email, phoneNumber } = req.body
    // check existance
    const userExist = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    });
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 401))
    }
    // genreate otp
    const otp = generateOTP()
    // send otp 
    await sendOTP(userExist.email, otp)
    userExist.otp = otp; // Save OTP to user record
    userExist.otpExpires = Date.now() + 3600000; // OTP expires in 1 hour
    // save otp in db to check
    const addOtp = await userExist.save()
    if (!addOtp) {
        return next(new AppError(messages.user.failToUpdate, 500))
    }
    // send res
    return res.status(200).json({ message: messages.user.otpSent, success: true })
}

// rest password
export const resetPassword = async (req, res, next) => {
    // get data from req
    const { otp, newPassword, email } = req.body
    // check if user exist 
    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 401))
    }
    // check if otp valid
    if (userExist.otp !== otp || Date.now() > userExist.otpExpires) {
        return next(new AppError(messages.user.invalidOTP, 400));
    }
    // hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    userExist.password = hashedPassword
    // clear otp from db
    userExist.otp = undefined;
    userExist.otpExpires = undefined;
    // save edition in db 
    const updatedUser = await userExist.save()
    // handel fail
    if (!updatedUser) {
        return next(new AppError(messages.user.failToUpdate, 400))
    }
    // send res 
    return res.status(200).json({ message: messages.user.passwordUpdated, success: true })
}