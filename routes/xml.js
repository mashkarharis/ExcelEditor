
const express = require('express')
var xml_route = express()

xml_route.get('/view', function (req, res) {
    res.send('Upload XML UI')
})

module.exports = xml_route;
