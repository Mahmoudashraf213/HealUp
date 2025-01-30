import { customAlphabet } from "nanoid";
import { sendSms } from "./sendSms.js";
import { sendEmail } from "./sendEmail.js";


// Generate a random 6-digit OTP
export const generateOTP = customAlphabet("0123456789", 6);

// Send OTP via SMS
export const sendOTPSms = async (phoneNumber, otp) => {
    try {
        const message = `Your OTP code is: ${otp}. It is valid for 10 minutes.`;
        const smsResult = await sendSms(phoneNumber, message); // Using SMS sending utility

        if (smsResult.success) {
            console.log("OTP sent successfully to:", phoneNumber);
            return { success: true };
        } else {
            throw new Error(smsResult.error || "Failed to send OTP.");
        }
    } catch (error) {
        console.error("Error sending OTP via SMS:", error.message);
        return { success: false, error: error.message };
    }
};

// send otp via mail 
export const sendOTP = async (email, otp) => {
    const mailOptions = await sendEmail({
        to: email,
        subject: "Your OTP Code",
        html: `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
    })
};
