import ApiError from "../../utils/ApiError.js";
import bcrypt from 'bcrypt';
import redis from "../../config/redis.js";
import env from "../../config/env.js"

import userRepository from "../../repository/authRepository/auth.repository.js";
import refreshTokenRepository from "../../repository/authRepository/refreshToken.repository.js"


import {
    sendOTPEmail,
    sendResetPasswordEmail,
    sendWelcomeEmail
} from "./email.service.js";

import generateToken from "../../utils/generateToken.js";
import generateOTP from '../../utils/generateOtp.js';

import welcomeTemplate from "../../templates/welcome.template.js";
import otpTemplate from '../../templates/otp.template.js';
import resetPasswordTemplate from "../../templates/resetPassword.template.js";

import emailQueue from "../../queues/email.queue.js"

const SALT_ROUNDS = 12;


export const signupService = async (userData) => {


    let { username, email, password } = userData;

    username = username.trim();
    email = email.trim().toLowerCase();

    //check email or usernmae exist
    const emailExist = await userRepository.emailExist(email);

    if (!emailExist) {
        return new ApiError(409, "Email already exists.");
    }


    const usernameExist = await userRepository.usernameExist(username);

    if (!usernameExist) {
        return new ApiError(409, "Username already exists.");
    }

    //generate otp + expiry date

    const otp = generateOTP();

    //Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //set otp in redis

    const cacheKey = `signup:${email}`;

    await redis.set(
        cacheKey,
        JSON.stringify({
            email,
            username,
            password: hashedPassword,
            otp,
        }),
        'EX',
        300
    );


    //add email job to BullMQ

    await emailQueue.add("sendOtp", {
        username,
        otp,
        email
    });



    return {
        email,
    };

};



export const verifyOtpService = async (userData) => {

    const { otp, email } = userData;

    const cacheKey = `signup:${email}`;

    const cacheData = await redis.get(cacheKey);


    // OTP/signup data expired or not found
    if (!cacheData) {
        throw new ApiError(400, "otp_expired");
    }

    const otpData = JSON.parse(cacheData);

    if (otp !== otpData.otp) {
        throw new ApiError(409, "otp_invalid")
    }

    const user = await userRepository.Create({
        username: otpData.username,
        email: otpData.email,
        password: otpData.password,
        isVerified: true
    });

    await redis.del(cacheKey);

    await emailQueue.add("welcomeEmail", {
        username: otpData.username,
        email: otpData.email
    });

    return user;

};


export const resendOtpService = async (userData) => {
    let { email } = userData;

    email = email.trim().toLowerCase();

    //check pending signup data inside redis

    const cacheKey = `signup:${email}`

    const cacheData = await redis.get(cacheKey);

    //no pending signup
    if (!cacheData) {
        throw new ApiError(400, "signup_expired");
    }

    const signupData = JSON.parse(cacheData);


    const otp = generateOTP();


    await redis.set(
        cacheKey,
        JSON.stringify({
            ...signupData,
            otp
        }),
        'EX',
        300
    );

    await emailQueue.add("sendOtp", {
        email: signupData.email,
        otp
    })

    return {
        email: signupData.email
    };

};


export const loginService = async (userData) => {

    let { email, password } = userData;

    email = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(400, "Invalid email or password")
    }

    if (!user.isVerified) {
        throw new ApiError(400, "Please verify your email")
    }

    if (!user.isActive) {
        throw new ApiError(400, "Account is deactivated")
    }


    //check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new ApiError(400, "password is incorrect")
    }

    //generate token

    const accessToken = generateToken(
        {
            id: user._id,
            email: user.email
        },
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_EXPIRES_IN

    );

    const refreshToken = generateToken(
        {
            id: user._id
        },
        env.REFRESH_TOKEN_SECRET,
        env.REFRESH_TOKEN_EXPIRES_IN
    );


    logger.info(accessToken);
    logger.info(refreshToken);

    await refreshTokenRepository.create({
        userId: user._id,
        token: refreshToken,
        expiredAt: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
        )
    })

    return {
        user: {
            email: user.email,
            username: user.username,
            id: user._id
        },
        accessToken,
        refreshToken
    }

};


export const profileService = async (userId) => {

    const cacheKey = `profile:${userId}`;
    const redisData = await redis.get(cacheKey);

    if (redisData) {
        return JSON.parse(redisData);
    }


    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(400, "profile not found")
    }

    const profile = {
        id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt
    }


    await redis.set(
        cacheKey,
        JSON.stringify(profile),
        'EX',
        300
    );

    return profile;

};


export const logoutService = async (userId) => {

    await refreshTokenRepository.deleteByUserId(userId);

};

export const deleteAccountService = async (userData) => {

    const { password, userId } = userData;

    const user = await userRepository.findByIdWithPassword(userId);

    // Compare plain password with hashed password
    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatch) {
        throw new ApiError(400, "password_not_match");
    }

    await reds.del(`profile:${userId}`)

    await refreshTokenRepository.deleteByUserId(userId);

    await userRepository.findByIdAndDelete(userId)

};

export const deactivateAccountService    = async (userId) => {

    const user = await userRepository.deactivateAccount(userId);

    if (!user) {
        throw new ApiError(404, "user_not_found");
    }

    await redis.del(`profile:${userId}`);

    await refreshTokenRepository.deleteByUserId(userId);

    return user;
};


export const updateProfileService = async (userId, data) => {

    const user = await userRepository.updateProfile(userId, data);

    if (!user) {
        throw new ApiError(404, "user_not_found");
    }

    await redis.del(`profile:${userId}`);

    return {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isActive: user.isActive
    };
};



export const changePasswordService = async (userId, data) => {

    const { oldPassword, newPassword } = data;

    const user = await userRepository.findByIdWithPassword(userId);

    if (!user) {
        throw new ApiError(404, "user_not_found");
    }

    const match = await bcrypt.compare(
        oldPassword,
        user.password
    );

    if (!match) {
        throw new ApiError(400, "old_password_wrong");
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        SALT_ROUNDS
    );

    await userRepository.changePassword(
        userId,
        hashedPassword
    );

    await refreshTokenRepository.deleteByUserId(userId);

    return null;
};




export const forgotPasswordService = async (email) => {

    email = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(404, "user_not_found");
    }

    const otp = generateOTP();

    const cacheKey = `resetPassword:${email}`;

    await redis.set(
        cacheKey,
        JSON.stringify({
            email,
            otp
        }),
        "EX",
        300
    );

    await emailQueue.add(
        "resetPassword",
        {
            email,
            otp
        }
    );

    return {
        email
    };
};




export const resetPasswordService = async (data) => {

    const { email, otp, newPassword } = data;

    const cacheKey = `resetPassword:${email}`;

    const redisData = await redis.get(cacheKey);

    if (!redisData) {
        throw new ApiError(400, "otp_expired");
    }

    const otpData = JSON.parse(redisData);

    if (otpData.otp !== otp) {
        throw new ApiError(400, "otp_invalid");
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        SALT_ROUNDS
    );


    await userRepository.updatePasswordByEmail(
        email,
        hashedPassword
    );


    await redis.del(cacheKey);

    const user = await userRepository.findByEmail(email);

    await refreshTokenRepository.deleteByUserId(
        user._id
    );

    return null;
};


export const refreshAccessTokenService = async (refreshToken) => {

    if (!refreshToken) {
        throw new ApiError(
            401,
            "Refresh token missing"
        );
    }


    // Verify JWT refresh token
    const decoded = jwt.verify(
        refreshToken,
        env.REFRESH_TOKEN_SECRET
    );


    const storedToken =
        await refreshTokenRepository.findByToken(refreshToken);


    if (!storedToken) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }


    // Create new access token
    const accessToken = generateToken(
        {
            id: decoded.id
        },
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_EXPIRES_IN
    );


    // Refresh token rotation
    const newRefreshToken = generateToken(
        {
            id: decoded.id
        },
        env.REFRESH_TOKEN_SECRET,
        env.REFRESH_TOKEN_EXPIRES_IN
    );


    await refreshTokenRepository.deleteByToken(
        refreshToken
    );


    await refreshTokenRepository.create({
        userId: decoded.id,
        token: newRefreshToken,
        expiredAt: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
        )
    });


    return {
        accessToken,
        refreshToken: newRefreshToken
    };
};








