const jwt = require('jsonwebtoken');

function denyAccess(res) {
    return res.status(401).send('Access denied.')
}

function auth(req, res, next) {
    // Looks for the data on the header that matches
    const token = req.header('x-auth-token');
    // If no token is given, then we deny the access to the user
    if(!token) denyAccess(res);
    try {
        // Decodes the token using the private key
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        if(decoded.type !== 'Tutor')
            denyAccess(res);

        req.tutor = decoded;
        next();        
    } catch(e) {
        res.status(400).send('Invalid token');
    }
}

module.exports = auth;
