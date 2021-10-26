
const express = require('express')
var xml_route = express()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
let xmlParser = require('xml2json');
var firebase = require('firebase/app');
var database = require('firebase/database');
const firebaseConfig = {
    apiKey: "AIzaSyCblNIxjZF4kKUbNL8UqHhXTeEjkA5XcUQ",
    authDomain: "excelconverter-52339.firebaseapp.com",
    projectId: "excelconverter-52339",
    storageBucket: "excelconverter-52339.appspot.com",
    messagingSenderId: "1089992563454",
    appId: "1:1089992563454:web:8a3c6866982866934163af"
};

xml_route.get('/view', function (req, res) {
    res.render("xml_view", { title: "XML" });
})

xml_route.post('/upload', upload.single('xml'), async function (req, res, next) {
    try {
        // File Type Checking
        console.log(req.file)
        if (!(req.file.mimetype == 'application/xml' || req.file.mimetype == 'text/xml')) {
            res.status(400)
            res.send("only XML are allowed")
            res.end()
            return
        }
        console.log("File Validated Sucessfully")
        // Processing Data
        var dict = {}
        const data = await fs.readFileSync(req.file.path, 'utf8')
        sources_targets = JSON.parse(xmlParser.toJson(data))['xliff']['file']['body']['trans-unit']
        if (!Array.isArray(sources_targets)) {
            var source = sources_targets['source']['$t']
            var target = sources_targets['target']['$t']

            if (source != null && target != null) {
                dict[source] = target
            }

        } else {
            sources_targets.forEach(element => {
                var source = element['source']['$t'].toLowerCase()
                var target = element['target']['$t']

                if (source != null && target != null) {
                    dict[source] = target
                }
            });

        }
        console.log("File Processed Successfully")


        // Firebase
        console.log("Writing to Database Started")
        const firebase_app = await firebase.initializeApp(firebaseConfig);
        const fire_database = await database.getDatabase(firebase_app)
        await database.update(database.ref(fire_database, '/wordstore'), dict);
        console.log("Writing to Database Finished")

        res.status(200)
        res.send("New words added Successfully")
        res.end()
        return


    } catch (ex) {
        res.status(500)
        res.send("Something Went Wrong : " + ex)
        res.end()
        return

    }



})


module.exports = xml_route;
