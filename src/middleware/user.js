const jwt = require('jsonwebtoken');
const {User} = require('../model/user');

const userMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token || typeof token !== 'string') {
        return res.status(401).send({message: 'Access Denied. No token provided.'});
    }
    try {
        const decoded = jwt.verify(token, 'Adnan$4321');
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).send({message: 'User not found.'});
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(400).send({message: 'Invalid token.', error: error.message});
    }
};

module.exports = {userMiddleware};