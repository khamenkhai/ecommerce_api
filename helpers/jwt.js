const jwt = require("jsonwebtoken");

const User = require("../models/user");

const auth = async (req, res, next) => {
    // check header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ 
            success: false, 
            message: "Authentication invalid: No token provided" 
        });
       
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = User.findById(payload.id).select("-password");
        req.user = user;
        req.user = { userId: payload.userId, name: payload.name }

        next();
    } catch (e) {
        return res.status(401).json({ 
            success: false, 
            message: "Authentication invalid!!" 
        });
    }
}

module.exports = auth;