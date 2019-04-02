const jwt = require('jsonwebtoken');

function denyAccess(res) {
    return res.status(401).send('Access denied.')
}

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) denyAccess(res);
    try {
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        if(decoded.type !== 'Admin')
            denyAccess(res);

        req.admin = decoded;
        next();        
    } catch(e) {
        res.status(401).send('Invalid token');
    }
}

module.exports = auth;
