import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
    refreshTokenOptions,
    accessTokenOptions,
} from "../../utils/cookieOptions.js";

import {
    signupService,
    loginService,
    verifyOtpService,
    resendOtpService,
    resetPasswordService,
    forgotPasswordService,
    profileService,
    logoutService,
    updateProfileService,
    changePasswordService,
    deleteAccountService,
    deactivateAccountService   ,
    refreshAccessTokenService
} from "../../service/authService/auth.service.js";


// =====================================
// Signup
// =====================================

export const Signup = TryCatch(async (req, res) => {
    const data = await signupService(req.body);

    return res.status(201).json(
        new ApiResponse(
            201,
            req.t("otp_sent"),
            data
        )
    );
});


// =====================================
// Verify OTP
// =====================================

export const VerifyOTP = TryCatch(async (req, res) => {
    const data = await verifyOtpService(req.body);

    return res.status(201).json(
        new ApiResponse(
            201,
            req.t("user_created"),
            data
        )
    );
});


// =====================================
// Resend OTP
// =====================================

export const ResendOTP = TryCatch(async (req, res) => {
    const data = await resendOtpService(req.body);

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("otp_resent"),
            data
        )
    );
});


// =====================================
// Login
// =====================================

export const Login = TryCatch(async (req, res) => {
    const {
        user,
        accessToken,
        refreshToken,
    } = await loginService(req.body);

    res.cookie(
        "accessToken",
        accessToken,
        accessTokenOptions
    );

    res.cookie(
        "refreshToken",
        refreshToken,
        refreshTokenOptions
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("login_success"),
            user
        )
    );
});


// =====================================
// Profile
// =====================================

export const Profile = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const user = await profileService(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("profile_success"),
            user
        )
    );
});


// =====================================
// Logout
// =====================================

export const Logout = TryCatch(async (req, res) => {
    const userId = req.user._id;

    await logoutService(userId);

    res.clearCookie(
        "accessToken",
        accessTokenOptions
    );

    res.clearCookie(
        "refreshToken",
        refreshTokenOptions
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("logout_success")
        )
    );
});


// =====================================
// Forgot Password
// =====================================

export const ForgotPassword = TryCatch(async (req, res) => {
    const { email } = req.body;

    await forgotPasswordService(email);

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("password_reset_otp_sent")
        )
    );
});


// =====================================
// Reset Password
// =====================================

export const ResetPassword = TryCatch(async (req, res) => {
    const data = await resetPasswordService(req.body);

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("password_reset"),
            data
        )
    );
});


// =====================================
// Update Profile
// =====================================

export const UpdateProfile = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const user = await updateProfileService(
        userId,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("profile_updated"),
            user
        )
    );
});


// =====================================
// Change Password
// =====================================

export const UpdatePassword = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const result = await changePasswordService(
        userId,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("password_changed"),
            result
        )
    );
});


// =====================================
// Delete Account
// =====================================

export const DeleteAccount = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { password } = req.body;

    await deleteAccountService(
        userId,
        password
    );

    res.clearCookie(
        "accessToken",
        accessTokenOptions
    );

    res.clearCookie(
        "refreshToken",
        refreshTokenOptions
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("account_deleted"),
            null
        )
    );
});


// =====================================
// Deactivate Account
// =====================================

export const DeactivateAccount = TryCatch(async (req, res) => {
    const userId = req.user._id;

    await deactivateAccountService(userId);

    res.clearCookie(
        "accessToken",
        accessTokenOptions
    );

    res.clearCookie(
        "refreshToken",
        refreshTokenOptions
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            req.t("account_deactivated"),
            null
        )
    );
});



export const RefreshAccessToken = TryCatch(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    const {
        accessToken,
        refreshToken: newRefreshToken
    } = await refreshAccessTokenService(refreshToken);


    res.cookie(
        "accessToken",
        accessToken,
        accessTokenOptions
    );


    res.cookie(
        "refreshToken",
        newRefreshToken,
        refreshTokenOptions
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            "Access token refreshed successfully"
        )
    );
});