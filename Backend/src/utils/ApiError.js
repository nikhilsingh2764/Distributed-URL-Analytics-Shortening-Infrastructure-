class ApiError extends Error {

    constructor(statuscode, message = "something went wrong", errors = []) {

        super(message);
        this.statuscode = statuscode;
        this.message = message;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);  //saves a clean stack trace (where the error happened) in the current error object.


    }


}

export default ApiError;