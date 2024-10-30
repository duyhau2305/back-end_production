module.exports = {
    success(res, message, data) {
        return res.status(200).json({
            status: 200,
            message: message,
            data: data
        });
    }
}