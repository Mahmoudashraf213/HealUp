import axios from "axios";

export const sendSms = async (phoneNumber, message) => {
    const url = `${process.env.INFOBIP_BASE_URL}/sms/2/text/advanced`;
    try {
        console.log("Request URL:", url);
        const response = await axios.post(
            url,
            {
                messages: [
                    {
                        destinations: [{ to: phoneNumber }],
                        text: message,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `App ${process.env.INFOBIP_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("SMS sent successfully:", response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error sending SMS:", error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};
