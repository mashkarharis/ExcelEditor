const express = require('express')
const path = require("path");
const app = express()

const port = process.env.PORT || "8000";
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));
var hbs =require('hbs')
app.set('view engine', 'hbs');

var xml = require('./routes/xml')
var excel = require('./routes/excel')

app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});
app.use('/xml', xml)
app.use('/excel', excel)


app.listen(port, () => console.log("Listening on port 8000"))