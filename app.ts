'use strict';

let swaggerExpressMw = require('swagger-express-mw');
let app = require('express')();
let cors = require('cors');
let api = require('./api');

module.exports = app; // for testing

let corsOptions = {
    credentials: true,
    origin: '*',
};

let config = {
    appRoot: __dirname, // required config
    swaggerSecurityHandlers: {
        api_key: function (req, authOrSecDef, scopesOrApiKey, cb) {
            console.log('in apiKeySecurity (req: ' + JSON.stringify(req.headers) +
                ', def: ' + JSON.stringify(authOrSecDef) + ', scopes: ' + scopesOrApiKey + ')');

            // your security code
            if (api.shared.Config.settings.api_key === scopesOrApiKey) {
                cb();
            } else {
                cb(new Error('access denied!'));
            }
        },
    },
};


swaggerExpressMw.create(config, function (err, swaggerExpress) {
    if (err) { throw err; }

    app.use(cors(corsOptions));
    swaggerExpress.register(app);

    // Custom error handler that returns JSON
    app.use(function (error, req, res, next) {
        if (typeof err !== 'object') {
            // If the object is not an Error, create a representation that appears to be
            err = {
                message: String(error), // Coerce to string
            };
        } else {
            // Ensure that err.message is enumerable (It is not by default)
            Object.defineProperty(err, 'message', { enumerable: true });
        }

        // Return a JSON representation of #/definitions/ErrorResponse
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });

    let port = process.env.PORT || 10040;

    // app.use(function (req, res, next) {
    //     next();
    // });


    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/{instrument}/candles/{granularity}/publish/{topic}']) {
        console.log('try this:\ncurl http://127.0.0.1:' + port + swaggerExpress.runner.swagger.basePath +
            '/{instrument}/candles/{granularity}/publish/{topic}');
    }
});
