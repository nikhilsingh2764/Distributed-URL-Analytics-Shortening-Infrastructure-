class ApiResponse {

    constructor(statuscode, message = "success", data = null) {
        this.status = true;
        this.statuscode = statuscode;
        this.message = message;
        this.data = data;
    }

}

export default ApiResponse;