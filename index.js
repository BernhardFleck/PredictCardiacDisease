const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
http.listen(PORT, () => console.log(`server listening on port ${PORT}!`));

var brain = require("brain.js");
var net = new brain.NeuralNetwork(); //LSTM vs NeuronalNetwork ?

let trainingData = []
const fs = require("fs");
const { parse } = require("csv-parse");
fs.createReadStream("./heart_disease_uci_dataset_reduced.csv")
    .pipe(parse({ delimiter: ";", from_line: 2 }))
    .on("data", function (row) {
        let numColumn = parseInt(row.pop())
        let trainingRow = { input: row.map(Number), output: [numColumn] }
        trainingData.push(trainingRow)
        

    })
    .on("error", function (error) {
        console.log(error.message);
    })
    .on("end", function () {
        //console.log(trainingData)
        console.log("TRAINING - START")
        net.train(trainingData, {
            logPeriod: 2000,
            log: true,
            iterations: 30000
        });
        console.log("TRAINING - END")
        var expectedOutputOf0 = [0.4082, 0, 1, 0.1221, 0, 0.1342, 0, 0, 0, 0.001]
        var expectedOutputOf3 = [0.6735, 0, 0.6667, 0.1201, 0, 0.0405, 0.001, 0.001, 1, 1]
        var output = net.run(expectedOutputOf3)[0]; 
        console.log(output);
        console.log("END OF EVERYTHING")
        //output is always between 0 and 1 -> should the prediction column also be normalized? im prinzip auch wurscht oder?
        // um den tatsächlichen output zu bekommen benötigt es normalisierung (glaub ich), dann müsste eine zuteilung erfolgen, aber 
        // werte brauchen wir ja nicht? sie repräsentieren auch nur die kategorisierung, sagt also dasselbe aus wie wenn man gleich den ouput in % angibt

        // Fazit atm. stand 14.09.2022
        // expectedOutputOf0 liefert mir 0.00.. ALSO SUPER
        // expectedOutputOf3 liefert mir 0.99.. ALSO ES GEHT IN DIE RICHTIGE RICHTUNG, der Wert würde aber eher zu Prediction:4 passen, ist das Modell also zu schlecht/gut trainiert?
    });
