import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";


import {
    createUrlService,
    getAllUrlsService,
    getUrlByIdService,
    updateUrlService,
    deleteUrlService,
    redirectUrlService,
    getAnalyticsService
} from "../../service/urlService/url.service.js";


//create short url
export const createUrl = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const data = await createUrlService(userId, req.body);

    return res.status(201).json(
        new ApiResponse(201, "Short URL created successfully", data)
    );


});

export const getAllUrls = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const data = await getAllUrlsService(userId, req.query);

    return res.status(200).json(
        new ApiResponse(200, "URLs fetched successfully", data)
    );

});

export const getUrlById = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const data = await getUrlByIdService(userId, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, "URL fetched successfully", data)
    );

});


export const updateUrl = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const data = await updateUrlService(userId, req.params.id, req.body);

    return res.status(200).json(
        new ApiResponse(200, "URL updated successfully", data)
    );


});

export const deleteUrl = TryCatch(async (req, res) => {

    const userId = req.user._id;

    await deleteUrlService(userId, req.params.id);

    return res.status(200).json(
        new ApiResponse(200, "URL deleted successfully")
    );


});

export const redirectUrl = TryCatch(async (req, res) => {

    const { shortCode } = req.params;

    const originalUrl = await redirectUrlService(shortCode, req);

    return res.redirect(originalUrl)

});


export const getAnalytics = TryCatch(async (req, res) => {


    const userId = req.user._id;

    const data = await getAnalyticsService(
        userId,
        req.params.id,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(200, "Analytics fetched successfully", data)
    );


});


