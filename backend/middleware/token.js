const jwt = require('jsonwebtoken')

const tokenMiddle = (req, res, next) => {
    try {
        const token = req.headers['access_token']
        const decodedToken = jwt.verify(token, 'secretKey')
        req.userToken = { userId: decodedToken.userId }
        next()
    } catch (error) {
        res.json({
            statusCode: 403,
            status: false,
            message: "unauthorized user"
        })
        console.log("middle error");
    }
}

module.exports = tokenMiddle