import { nanoid } from "nanoid";

import ApiError from "../../utils/ApiError.js";
import redis from "../../config/redis.js";

import urlRepository from "../../repository/urlRepository/url.repository.js";


// ======================================================
// CREATE SHORT URL
// ======================================================

export const createUrlService = async (userId, urlData) => {

    const { originalUrl, expiresAt } = urlData;

    const shortCode = nanoid(7);

    // Check short-code collision
    const existingUrl = await urlRepository.findByShortCode(shortCode);

    if (existingUrl) {
        throw new ApiError(409, "Short code already exists");
    }

    const url = await urlRepository.create({
        userId,
        originalUrl,
        shortCode,
        expiresAt
    });

    return {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `/r/${url.shortCode}`,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt
    };
};


// ======================================================
// GET ALL URLS
// Pagination + Search + Sort
// ======================================================

export const getAllUrlsService = async (userId, query) => {

    let {
        page = 1,
        limit = 10,
        search = "",
        sort = "createdAt",
        order = "desc"
    } = query;

    page = Number(page);
    limit = Number(limit);

    // Prevent unreasonable pagination
    if (limit > 100) {
        limit = 100;
    }

    const skip = (page - 1) * limit;

    // Search filter
    const filter = {};

    if (search) {
        filter.originalUrl = {
            $regex: search,
            $options: "i"
        };
    }

    // Sort
    const sortOrder = order === "asc" ? 1 : -1;

    const sortObject = {
        [sort]: sortOrder
    };

    const [urls, total] = await Promise.all([

        urlRepository.findAllByUserId(
            userId,
            filter,
            {
                skip,
                limit,
                sort: sortObject
            }
        ),

        urlRepository.countByUserId(
            userId,
            filter
        )

    ]);

    return {
        urls,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};


// ======================================================
// GET SINGLE URL BY ID
// Redis Cache
// ======================================================

export const getUrlByIdService = async (userId, id) => {

    const cacheKey = `url:${id}`;

    const cachedUrl = await redis.get(cacheKey);

    if (cachedUrl) {

        const url = JSON.parse(cachedUrl);

        // Important: cache must not bypass ownership
        if (String(url.userId) !== String(userId)) {
            throw new ApiError(404, "URL not found");
        }

        return url;
    }

    const url = await urlRepository.findByIdAndUserId(
        id,
        userId
    );

    if (!url) {
        throw new ApiError(404, "URL not found");
    }

    const response = {
        id: url._id,
        userId: url.userId,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt
    };

    await redis.set(
        cacheKey,
        JSON.stringify(response),
        "EX",
        300
    );

    return response;
};


// ======================================================
// UPDATE URL
// MongoDB → Delete Redis Cache
// ======================================================

export const updateUrlService = async (
    userId,
    id,
    updateData
) => {

    const { originalUrl, expiresAt } = updateData;

    const data = {};

    if (originalUrl !== undefined) {
        data.originalUrl = originalUrl;
    }

    if (expiresAt !== undefined) {
        data.expiresAt = expiresAt;
    }

    if (Object.keys(data).length === 0) {
        throw new ApiError(400, "No data to update");
    }

    const url = await urlRepository.updateByIdAndUserId(
        id,
        userId,
        data
    );

    if (!url) {
        throw new ApiError(404, "URL not found");
    }

    // Invalidate old cached data
    await redis.del(`url:${id}`);

    return {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        updatedAt: url.updatedAt
    };
};


// ======================================================
// DELETE URL
// MongoDB → Delete Redis Cache
// ======================================================

export const deleteUrlService = async (userId, id) => {

    const url = await urlRepository.findByIdAndUserId(
        id,
        userId
    );

    if (!url) {
        throw new ApiError(404, "URL not found");
    }

    await urlRepository.deleteByIdAndUserId(
        id,
        userId
    );

    // Delete cached URL
    await redis.del(`url:${id}`);

    // Later, when redirect caching is added:
    // await redis.del(`redirect:${url.shortCode}`);

    return true;
};


// ======================================================
// PUBLIC REDIRECT
// Redis → MongoDB
// ======================================================

export const redirectUrlService = async (shortCode) => {

    const redirectCacheKey = `redirect:${shortCode}`;

    // 1. Check Redis
    const cachedUrl = await redis.get(
        redirectCacheKey
    );

    if (cachedUrl) {

        return cachedUrl;
    }

    // 2. Redis miss → MongoDB
    const url = await urlRepository.findByShortCode(
        shortCode
    );

    if (!url) {
        throw new ApiError(404, "Short URL not found");
    }

    // 3. Check expiry
    if (
        url.expiresAt &&
        new Date(url.expiresAt) <= new Date()
    ) {
        throw new ApiError(410, "Short URL has expired");
    }

    // 4. Store original URL in Redis
    await redis.set(
        redirectCacheKey,
        url.originalUrl,
        "EX",
        3600
    );

    // 5. Return original URL
    return url.originalUrl;
};


// ======================================================
// GET ANALYTICS
// This will be completed with Click Repository
// ======================================================

export const getAnalyticsService = async (
    userId,
    urlId,
    query
) => {

    const url = await urlRepository.findByIdAndUserId(
        urlId,
        userId
    );

    if (!url) {
        throw new ApiError(404, "URL not found");
    }

    // Analytics repository will be connected here.
    // We will add:
    //
    // total clicks
    // today's clicks
    // browser statistics
    // device statistics
    // country statistics
    // date-range analytics

    return {
        urlId: url._id,
        shortCode: url.shortCode,
        totalClicks: url.clicks
    };
};