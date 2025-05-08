const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Plese log-in first." });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ error: "Invalid token." });
    }
};
