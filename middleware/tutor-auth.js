const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied.');
    try {
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        req.tutor = decoded;
        next();
        
    }catch(e) {
        res.status(400).send('Invalid token');
    }
}

module.exports = auth;