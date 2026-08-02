const errorMiddleware = (err, req, res, next) => {

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        
        success: false,
        statusCode,
        message: err.message || "something went wrong",
        errors: err.errors || [],

    });


};

export default errorMiddleware;