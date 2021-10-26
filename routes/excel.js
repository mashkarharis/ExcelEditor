var express = require('express')
var excel_route = express()

excel_route.get('/view', function (req, res) {
    res.render("excel_view", { title: "Excel" });
})
module.exports = excel_route;