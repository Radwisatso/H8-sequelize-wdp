const jwt = require('jsonwebtoken');
const { User } = require("../models")

async function authentication(req, res, next) {
    try {
        if (!req.headers.authorization) {
            throw "User not authorized"
        }
        let token = req.headers.authorization.split(" ")[1]
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const foundUser = await User.findOne({
            where: {
                id: verifiedToken.id,
                email: verifiedToken.email
            }
        })
        if (!foundUser) {
            throw "User not authorized"
        }

        req.user = {
            id: verifiedToken.id,
            email: verifiedToken.email
        }

        next()
    } catch (error) {
        res.send(error)
    }
}

module.exports = authentication