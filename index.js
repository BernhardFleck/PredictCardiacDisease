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
fs.createReadStream("./heart_trainingData.csv")
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

        tryOutTestData()
    });

function tryOutTestData() {
    console.log("TESTING DATA - START")
    let counter = 0
    let correctCounter = 0
    let failedCounter = 0

    fs.createReadStream("./heart_testData.csv")
        .pipe(parse({ delimiter: ";", from_line: 2 }))
        .on("data", function (row) {
            let heartDiseaseColumn = parseInt(row.pop())
            let testingRow = row.map(Number)
            let output = net.run(testingRow)[0];
            let isPredictionCorrect = output == heartDiseaseColumn

            if (isPredictionCorrect) {
                console.log(`${testingRow} CORRECT prediction `)
                correctCounter++
            }
            else {
                console.log(`${testingRow} FAILED prediction. Output ${output} although ${heartDiseaseColumn} was expected`)
                failedCounter++
            }
            counter++
        })
        .on("error", function (error) {
            console.log(error.message);
        })
        .on("end", function () {
            console.log("TESTING DATA - END")
            let failedPercentage = (failedCounter / counter * 100).toFixed(2)
            let correctPercentage = (correctCounter / counter * 100).toFixed(2)
            console.log(`FAILED ${failedPercentage}%; CORRECT ${correctPercentage}%`)
            console.log(`COUNTED ${counter} rows`)
        });
}

