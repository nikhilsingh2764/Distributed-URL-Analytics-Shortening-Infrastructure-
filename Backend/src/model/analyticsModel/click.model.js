import mongoose from "mongoose";

const clickSchema = new mongoose.Schema({

    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url",
        required: true,
        index: true
    },

    ipAddress: {
        type: String
    },

    userAgent: {
        type: String

    },

    browser: {
        type: String

    },

    device: {
        type: String

    },

    country: {
        type: String

    }


}, { timestamps: true });

const Click = mongoose.model("Click", clickSchema);

export default Click;