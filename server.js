const express = require("express");
const multer = require("multer");
const csv = require("fast-csv");
const fs = require("fs");

const app = express();

let checkFileType = (req, file, callback) => {
    if (file.mimetype.includes("csv")) callback(null, true);
    else callback("Invalid file format, only csv is allowed", false);
};
let upload = multer({ dest: "uploads/", fileFilter: checkFileType });

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.post("/upload", upload.single("csv"), async(req, res, next) => {
    let select_fields = req.body.select_fields || [];

    try {
        if (req.file == undefined) return res.send("Please select a CSV file");

        let filePath = __dirname + "/uploads/" + req.file.filename;
        let contacts = [];

        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                if (select_fields != undefined && select_fields.length > 0) {
                    let formattedOuput = {
                        "First Name": row["First Name"],
                        "Last Name": row["Last Name"],
                        Age: row["Age"],
                    };
                    contacts.push(formattedOuput);
                } else {
                    contacts.push(row);
                }
            })
            .on("end", (rowCount) => {
                res.json(contacts);
            });

        // return res.json(contacts);
    } catch (err) {
        console.log("err", err);
    }
});

app.listen("3000", () => {
    console.log("APp listening on port 3000");
});