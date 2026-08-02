import { Worker } from "bullmq";
import redis from "../config/redis.js";

import {
    sendOTPEmail,
    sendResetPasswordEmail,
    sendWelcomeEmail,
} from "../services/email.service.js";


const emailWorker = new Worker(
    "email",

    async (job) => {

        switch (job.name) {

            case "sendOtp":

                await sendOTPEmail({
                    email: job.data.email,
                    otp: job.data.otp,
                });

                break;


            case "resetPasswordOtp":

                await sendResetPasswordEmail({
                    email: job.data.email,
                    otp: job.data.otp,
                });

                break;


            case "welcomeEmail":

                await sendWelcomeEmail({
                    email: job.data.email,
                    username: job.data.username,
                });

                break;


            default:
                throw new Error(
                    `Unknown email job: ${job.name}`
                );
        }
    },

    {
        connection: redis,
    }
);


emailWorker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed`);
});


emailWorker.on("failed", (job, error) => {
    console.error(
        `Email job ${job?.id} failed:`,
        error.message
    );
});


export default emailWorker;