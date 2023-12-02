class ResponseHanding {
    constructor(res, statusCode, message, success, data) {
        this.statusCode = statusCode
        this.message = message
        this.success = success
        this.data = data
        this.res = res

        return res.status(statusCode).json({
            success:success,
            message:message,
            data:data
        })
    }
}
module.exports = ResponseHanding