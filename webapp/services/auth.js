const authCheck = require('./validator');

exports.authenticate = (req, res, next) => {
    // make authenticate path public
    if (req.path === '/v1/user/') {
        return next();
    }
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }
  
    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];
    let user = authCheck.validateUser({ username, password });
    if (user) {
        res.locals.user = user;
        next(); // authorized
    }else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        err.status = 401;
        next(err);
    }
   
  }
