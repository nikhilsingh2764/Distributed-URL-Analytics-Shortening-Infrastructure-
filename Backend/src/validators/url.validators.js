import { body, param, query } from "express-validator";


//create short url
export const createUrlValidator = [

    body("originalUrl")
        .trim()
        .notEmpty()
        .withMessage("Original URL is required")
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true
        })
        .withMessage("Invalid URL")

];



// URL ID
export const urlIdValidator = [

    param("id")
        .trim()
        .notEmpty()
        .withMessage("URL ID is required")
        .isMongoId()
        .withMessage("Invalid URL ID")


];


// Short Code
export const shortCodeValidator = [

    param("shortCode")
        .trim()
        .notEmpty()
        .withMessage("shortcode is required")
];

// Update URL
export const updateUrlValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid URL ID"),

    body("originalUrl")
        .optional()
        .trim()
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true
        })
        .withMessage("Invalid URL"),

    body("expiresAt")
        .optional()
        .isISO8601()
        .withMessage("Invalid expiry date")
];

// Get URLs
export const getUrlsValidator = [

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be at least 1"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("search")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search is too long"),

    query("sort")
        .optional()
        .isIn(["createdAt", "clicks", "expiresAt"])
        .withMessage("Invalid sort field"),

    query("order")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Order must be asc or desc")

];