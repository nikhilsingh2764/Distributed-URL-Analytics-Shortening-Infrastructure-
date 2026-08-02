import jwt from "jsonwebtoken";

const generateToken = (payload, secret, expireIn) => {

    return jwt.sign(
        payload,
        secret,
        {
            expireIn
        }
    )
};

export default generateToken;