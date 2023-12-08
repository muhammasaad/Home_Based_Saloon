class ResponseHanding {
    constructor(res, statusCode, message, success, data, token) {
        this.statusCode = statusCode
        this.message = message
        this.success = success
        this.data = data
        this.res = res
        this.token = token
        
        return res.status(statusCode).json({
            success:success,
            message:message,
            data:data,
            token: token
        })
    }
}
module.exports = ResponseHanding