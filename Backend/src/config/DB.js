import mongoose from "mongoose";
import logger from "./logger.js";
import env from "./env.js";


const connectDB = async () => {


    try {

        const connection = await mongoose.connect(env.MongoDB_URL);
        logger.info(`MongoDB connected Successfully: ${connection.connection.host}`);

    } catch (error) {

        logger.error(error,'MongoDB connected Failed');
        throw error;
        
    }



};

export default connectDB;