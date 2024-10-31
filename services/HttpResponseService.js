module.exports = {
    success(res, message, data) {
        return res.status(200).json({
            status: 200,
            message: message,
            data: data
        });
    },

    notFound(res, errorMsg) {
        return res.status(404).json({
            errorCode: 404,
            errorMsg: errorMsg
        });
    },

    internalServerError(res, errorData) {
        return res.status(500).json({
            errorCode: 500,
            errorMsg: errorData?.message ?? 'InternalServerError',
            errorDetails: errorData
        });
    }
}