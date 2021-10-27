var express = require('express')
var excel_route = express()
const multer = require('multer')
const excelToJson = require('convert-excel-to-json');
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
let xlsx = require('json-as-xlsx')
const path = require('path')
var admin = require("firebase-admin");
var serviceAccount = require("../service_account.json");

excel_route.get('/view', function (req, res) {
    res.render("excel_view", { title: "Excel" });
})

excel_route.post('/convert', upload.single('excel'), async function (req, res, next) {
    try {
        console.log(req.file)
        // Firebase Initialize
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
        const fire_database = await admin.database()
        // File Type Checking
        if (req.file.mimetype != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            res.status(400)
            res.render("excel_view", { error: "Only XLSX are allowed" });
            res.end()
            return
        }
        console.log("File Validated Sucessfully")
        // Load Dictionary
        const wordstore = (await fire_database.ref('/wordstore').get()).toJSON();
        console.log(wordstore)
        // Processing Data
        const result = excelToJson({
            source: fs.readFileSync(req.file.path)
        });
        // Get sheets
        var sheets = Object.keys(result)
        // define data
        let final_xlsx = []

        // iterate each sheets
        sheets.forEach(id => {
            var xlsx_sheet = {}
            var columns = []
            var content = []
            var sheet = result[id]
            xlsx_sheet["sheet"] = id
            var row_no = 0
            sheet.forEach((row) => {

                var cell_ids = Object.keys(row)
                cell_ids.forEach(cell => {
                    var field = row[cell].toString().toLowerCase()
                    //console.log(field in Object.keys(wordstore))
                    if (Object.keys(wordstore).includes(field)) {
                        //console.log(field)

                        row[cell] = wordstore[field]
                    }
                    if (row_no == 0) {
                        columns.push({ 'label': row[cell], 'value': cell })
                    }

                });
                if (row_no != 0) {
                    content.push(row)
                }
                row_no += 1
            })
            xlsx_sheet['columns'] = columns
            xlsx_sheet['content'] = content
            final_xlsx.push(xlsx_sheet)
        });
        //console.log(JSON.stringify(final_xlsx))
        const name = Date.now()
        let settings = {
            fileName: 'downloads/' + name, // Name of the spreadsheet
            extraLength: 3, // A bigger number means that columns will be wider
            writeOptions: {} // Style options from https://github.com/SheetJS/sheetjs#writing-options
        }

        await xlsx(final_xlsx, settings)

        res.download("downloads/" + name + ".xlsx")



    } catch (ex) {
        res.status(500)
        res.render("excel_view", { error: "Something Went Wrong" + ex });
        res.end()
        return

    }



})


module.exports = excel_route;
