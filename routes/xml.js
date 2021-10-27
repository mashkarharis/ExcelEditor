
const express = require('express')
var xml_route = express()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
let xmlParser = require('xml2json');
var admin = require("firebase-admin");
var serviceAccount = require("../service_account.json");



xml_route.get('/view', function (req, res) {
    res.render("xml_view", { title: "XML" });
})

xml_route.post('/upload', upload.single('xml'), async function (req, res, next) {
    try {
        // File Type Checking
        console.log(req.file)
        if (!(req.file.mimetype == 'application/xml' || req.file.mimetype == 'text/xml')) {
            // res.status(400)
            // res.send("only XML are allowed")
            res.render("xml_view", { error: "Only XML are allowed" });
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
        if (!admin.apps.length) {
            await admin.initializeApp({
                apiKey: "AIzaSyCblNIxjZF4kKUbNL8UqHhXTeEjkA5XcUQ",
                authDomain: "excelconverter-52339.firebaseapp.com",
                projectId: "excelconverter-52339",
                storageBucket: "excelconverter-52339.appspot.com",
                messagingSenderId: "1089992563454",
                appId: "1:1089992563454:web:8a3c6866982866934163af",
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://excelconverter-52339-default-rtdb.firebaseio.com"
            });

        }

        //const firebase_app = await firebase.initializeApp(firebaseConfig);
        const fire_database = await admin.database()
        var secretkey = await (await fire_database.ref('/secret').get()).val()
        console.log(secretkey)
        if (secretkey != "Xe32FG") {
            res.render("xml_view", { error: "Invalid Secret Key" });
            return
        }
        await fire_database.ref('/wordstore').update(dict)
        //await database.update(database.ref(fire_database, '/wordstore'), dict);
        console.log("Writing to Database Finished")

        res.render("xml_view", { success: "New words added Successfully" });

    } catch (ex) {
        res.render("xml_view", { error: "Something Went Wrong" + ex });

    }
})

module.exports = xml_route;
