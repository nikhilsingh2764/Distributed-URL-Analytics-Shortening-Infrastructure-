import express from "express";

import {
    createUrl,
    getAllUrls,
    getUrlById,
    updateUrl,
    deleteUrl,
    redirectUrl,
    getAnalytics
} from "../../controller/urlController/url.controller.js";


import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validator.js";

import {
    createUrlValidator,
    getUrlsValidator,
    urlIdValidator,
    shortCodeValidator,
    updateUrlValidator
} from "../../validators/url.validators.js";

import {
    analyticsValidator
} from "../../validators/analytics.validators.js";

import {
    createUrlLimiter,
    redirectLimiter
} from "../../middleware/rateLimiter.middleware.js";



const router = express.Router();

// Create short URL
router.post(
    "/",
    authMiddleware,
    createUrlLimiter,
    createUrlValidator,
    validate,
    createUrl
)

// Get user's URLs
router.post(
    "/",
    authMiddleware,
    getUrlsValidator,
    validate,
    getAllUrls
)



// Get single URL
router.get(
    "/:id",
    authMiddleware,
    urlIdValidator,
    validate,
    getUrlById
);


// Update URL
router.patch(
    "/:id",
    authMiddleware,
    updateUrlValidator,
    validate,
    updateUrl
);


// Delete URL
router.delete(
    "/:id",
    authMiddleware,
    urlIdValidator,
    validate,
    deleteUrl
);


// Analytics
router.get(
    "/:id/analytics",
    authMiddleware,
    analyticsValidator,
    validate,
    getAnalytics
);


// Public redirect
router.get(
    "/redirect/:shortCode",
    redirectLimiter,
    shortCodeValidator,
    validate,
    redirectUrl
);



export default router; 