import { Queue } from "bullmq";
import redis from "../config/redis.js";

const emailQueue = new Queue("emailQueue", {
    connection: redis,
});

export default emailQueue;

//created queue named emailQueue
//in signup servce
//await emailQueue.add("sendOTP", {
//    email,
//    otp,
//});

//It does not send the email.
//It simply places a job into Redis.

//The worker (next file) listens to this queue and actually sends the email.