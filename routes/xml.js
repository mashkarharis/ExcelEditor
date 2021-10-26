var express = require('express')
var router = express.Router()

router.get('/view', function (req, res) {
    res.send('Upload XML UI')
})
