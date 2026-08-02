import { cleanEnv, str, port} from "envalid";

const env = cleanEnv(process.env, {
   NODE_ENV: str({
    choices:['development','production','testing'],
    default: "development"
   }),

   PORT:port({
      default:8000
   }),

   CLIENT_URL: str(),

   MongoDB_URL:str(),

   REDIS_URL: str(),

   JWT_ACCESS_SECRET: str(),

   JWT_REFRESH_SECRET: str(),

   SMTP_HOST: str(),

   SMTP_PORT: str(),

   SMTP_USER: str(),

   SMTP_PASS: str(),

   SMTP_FROM: str(),

   SENTRY_DSN: str(),


});

export default env;