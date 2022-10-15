const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
http.listen(PORT, () => console.log(`server listening on port ${PORT}!`));

var brain = require("brain.js");
var net = new brain.recurrent.LSTM(); //LSTM vs NeuronalNetwork ?

let trainingData = []
const fs = require("fs");
const { parse } = require("csv-parse");
fs.createReadStream("./heart.csv")
    .pipe(parse({ delimiter: ";", from_line: 2 }))
    .on("data", function (row) {
        let heartDiseaseColumn = parseInt(row.pop())
        let trainingRow = { input: row.map(Number), output: [heartDiseaseColumn] }
        trainingData.push(trainingRow)
        //console.log(trainingRow)
    })
    .on("error", function (error) {
        console.log(error.message);
    })
    .on("end", function () {
        //console.log(trainingData)
        console.log("TRAINING - START")
        net.train(trainingData, {
            logPeriod: 1,
            log: true,
            iterations: 5
        });
        console.log("TRAINING - END")

        var expectedOutputOf1 = [59, 0, 2, 164, 1, 2, 90]
        var expectedOutputOf0 = [38, 0, 1, 138, 0, 0, 173]
        var output = net.run(expectedOutputOf0)[0];
        console.log(output);
        console.log("END OF EVERYTHING")

    });

    //TODO training vs test data
