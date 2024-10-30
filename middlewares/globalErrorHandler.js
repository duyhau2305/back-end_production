module.exports = {
    globalErrorHandler(error, req, res, next) {
        {
            if (error) {
                let statusCode = 500;
                if (error?.httpStatusCode) {
                    statusCode = error.httpStatusCode;
                }
        
                res.status(statusCode).json({
                    status: statusCode,
                    message: error.message,
                    stack: error
                })
            } else {
                next();
            }
        };
    }
};