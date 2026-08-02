import { validationResult } from "express-validator";
import APiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

const validate = (req, res, next) => {

    const errors = validationResult(req);
    logger.info(errors.array());

    if (!errors.isEmpty()) {

        throw new APiError(400, "validation failed", errors.array());

    }

    next();

};

export default validate;