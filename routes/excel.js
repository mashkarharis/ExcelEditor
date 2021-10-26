var express = require('express')
var excel_route = express()

excel_route.get('/view', function (req, res) {
    res.send('Upload excel UI')
})
module.exports = excel_route;