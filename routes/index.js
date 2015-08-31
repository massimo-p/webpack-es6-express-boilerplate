let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('pages/index', {
        title: 'Express JS Demo'
    });
});

module.exports = router;