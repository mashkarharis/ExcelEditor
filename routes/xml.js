
const express = require('express')
var xml_route = express()

xml_route.get('/view', function (req, res) {
    res.render("xml_view", { title: "XML" });
})

module.exports = xml_route;
