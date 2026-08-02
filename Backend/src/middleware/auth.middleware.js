import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import userRepository from "../repository/authRepository/auth.repository.js";
import env from "../config/env.js";

const authMiddleware = async (req, res, next) => {

    try {

        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new ApiError(
                401,
                "Access token is missing"
            );
        }

        const decoded = jwt.verify(
            accessToken,
            env.ACCESS_TOKEN_SECRET
        );

        const user = await userRepository.findById(
            decoded.id
        );

        if (!user) {
            throw new ApiError(
                401,
                "User not found"
            );
        }

        if (!user.isActive) {
            throw new ApiError(
                403,
                "Account is deactivated"
            );
        }

        req.user = user;

        next();

    } catch (error) {
        next(error);
    }
};

export default authMiddleware;