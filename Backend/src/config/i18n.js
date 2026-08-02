import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nextMiddleware from "i18next-http-middleware";
import path from "path";


i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        fallbackLng: "en",

        preload: ["en", "hi"],

        backend: {
            loadPath: path.join(
                process.cwd(),
                "src/locales/{{lng}}/translation.json"
            ),
        },

        detection: {
            order: ["header"],
            lookupHeader: "accept-language",
        },

        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;

//for translation