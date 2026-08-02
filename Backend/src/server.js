import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/DB.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import "./config/sentry.js"; // initialize Sentry

// 1. Handle unexpected synchronous errors
process.on("uncaughtException", (error) => {
    logger.fatal(error, "Uncaught Exception");
    process.exit(1);
});

// 2. Handle unexpected Promise rejections
process.on("unhandledRejection", (reason) => {
    logger.fatal(reason, "Unhandled Rejection");
    process.exit(1);
});


const PORT = env.PORT || 6000;

const startServer = async () => {


    try {

        await connectDB();

        app.listen(PORT, () => {
            logger.info(`server is running at http://localhost:${PORT}`);
        })

    } catch (error) {
        logger.error(error, "failed to start server");
        process.exit(1);

    }


};

startServer();