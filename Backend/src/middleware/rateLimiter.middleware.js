import rateLimit from "express-rate-limit";
import redis from "../config/redis.js";
import {RedisStore} from "rate-limit-redis";
import ApiError from "../utils/ApiError.js";



//create store

const createStore=(prefix) => new RedisStore({
sendCommand: (...args)=>redis.call(...args),
prefix
});



//login limiter

export const loginLimiter= rateLimit({

store:createStore("login:"),

windowMs:15*60*1000,        //after 15 min it expire

max:5,

standardHeaders:true,

skipSuccessfulRequests:true,

legacyHeaders:false,

  handler: (req,res,next) => {
   return next(
        new ApiError(429,req.t("rateLimiter.login.tooManyRequests"))
    )
   }

});




export const signupLimiter = rateLimit({
    store:createStore("signup:"),

    windowMs: 60*60*1000,

    max:5,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.signup.tooManyRequests"))
        )
    }

});



export const verifyOtpLimiter = rateLimit({

    store:createStore("verifyOtp:"),

    windowMs: 15*60*1000,

    max:10,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.verifyOtp.tooManyRequests"))
        )
    }

});

export const resendOtpLimiter = rateLimit({

    store:createStore("resendotp:"),

    windowMs: 15*60*1000,

    max:3,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.resendOtp.tooManyRequests"))
        )
    }

});


export const forgotPasswordLimiter = rateLimit({

    store:createStore("forgotpassword:"),

    windowMs: 15*60*1000,

    max:5,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.forgotPassword.tooManyRequests"))
        )
    }

});


export const resetPasswordLimiter = rateLimit({

    store:createStore("resetpassword:"),

    windowMs: 15*60*1000,

    max:5,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.resetPassword.tooManyRequests"))
        )
    }

});


export const refreshTokenLimiter = rateLimit({

    store:createStore("refreshaccesstokenlimiter:"),

    windowMs: 1*60*1000,

    max:30,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.refreshToken.tooManyRequests"))
        )
    }

});





export const logoutLimiter = rateLimit({

    store:createStore("Logout:"),

    windowMs: 5*60*1000,

    max:20,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.logout.tooManyRequests"))
        )
    }

});


export const changePasswordLimiter = rateLimit({

    store:createStore("changepassword:"),

    windowMs: 60*60*1000,

    max:5,

    standardHeaders:true,

    legacyHeaders:false,

    handler: (req,res,next) =>{
        return next(
            new ApiError(429,req.t("rateLimiter.changePassword.tooManyRequests"))
        )
    }

});





export const createUrlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many URL creation requests"
});



export const redirectLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests"
});

