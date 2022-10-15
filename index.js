const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
http.listen(PORT, () => console.log(`server listening on port ${PORT}!`));

var brain = require("brain.js");
var model = new brain.NeuralNetworkGPU();

let trainingData = []
const fs = require("fs");
const { parse } = require("csv-parse");
fs.createReadStream("./heart_trainingDataNormalized.csv")
    .pipe(parse({ delimiter: ";", from_line: 2 }))
    .on("data", function (row) {
        //console.log(row)
        let heartDiseaseColumn = parseFloat(row.pop())
        //console.log(heartDiseaseColumn)
        //console.log(row)
        //console.log(row.map(parseFloat))
        let trainingRow = { input: row.map(parseFloat), output: [heartDiseaseColumn] }
        trainingData.push(trainingRow)
        //console.log(trainingRow)
        //console.log(trainingData)
    })
    .on("error", function (error) {
        console.log(error.message);
    })
    .on("end", function () {
        //console.log(trainingData)
        console.log("TRAINING - START")
        model.train(trainingData, {
            logPeriod: 1,
            log: true,
            //errorThresh: 0.0001,
            //learningRate: 0.6,
            iterations: 50
        });
        console.log("TRAINING - END")

        tryOutTestData()
    });

function tryOutTestData() {
    console.log("TESTING DATA - START")
    let counter = 0
    let correctCounter = 0
    let failedCounter = 0

    fs.createReadStream("./heart_testDataNormalized.csv")
        .pipe(parse({ delimiter: ";", from_line: 2 }))
        .on("data", function (row) {
            let heartDiseaseColumn = parseFloat(row.pop())
            let testingRow = row.map(parseFloat)
            let output = model.run(testingRow)[0];
            if (output > 0.5) output = 1.00
            else output = 0.00
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

