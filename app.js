let express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

let app = express();

// app
let config = require('./config');
let router = require('./routes');
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d'
}));
app.use(express.static(path.join(__dirname, 'views'), {
    maxAge: '1d'
}));

app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded


// here we declare the router middleware to intercept all the requests
app.use('/', router);

if (!module.parent) {
    app.listen(config.port, function() {
        console.log('Express server listening on port ' + config.port);
    });
}
module.exports = app;