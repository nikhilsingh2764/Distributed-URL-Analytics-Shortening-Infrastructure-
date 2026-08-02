import { param, query } from "express-validator";


// Get analytics for a URL
export const analyticsValidator = [

    param("id")
        .trim()
        .notEmpty()
        .withMessage("URL ID is required")
        .isMongoId()
        .withMessage("Invalid URL ID"),

    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date"),

    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date")

        
];