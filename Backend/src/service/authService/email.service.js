import env from "../../config/env.js";
import transporter from "../../config/mail.js";



export const sendOTPEmail = async ({ email, username, otp }) => {

    console.log("1. sendOTPEmail called");
    console.log("2. Sending email to:", email);


    const info = await transporter.sendMail({
        from: env.SMTP_FROM,
        to: email,
        subject: "Verify Your Email",
        html: otpTemplate(otp, username)
    });


    console.log("EMAIL SENT:", info.messageId);
    console.log("EMAIL RESPONSE:", info.response);

    return info;

};


export const sendResetPasswordEmail = async ({
    email,
    otp
}) => {

    await transporter.sendMail({
        from: env.SMTP_FROM,
        to: email,
        subject: "Reset Your Password",
        html: resetPasswordTemplate(otp),
    });

};


export const sendWelcomeEmail = async ({
    email,
    username
}) => {

    await transporter.sendMail({
        from: env.SMTP_FROM,
        to: email,
        subject: "Welcome to URL Shortener",
        html: welcomeTemplate(username),
    });

};