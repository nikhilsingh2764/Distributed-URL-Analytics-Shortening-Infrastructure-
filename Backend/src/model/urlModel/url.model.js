import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    originalUrl: {
        type: String,
        required: true,
        trim: true
    },

    shortUrl: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    clicks: {
        type: Number,
        default: 0
    },

    expiryAt: {
        type: Date
    }


}, { timestamps: true })

const Url = mongoose.model("Url", urlSchema);

export default URL;



















































