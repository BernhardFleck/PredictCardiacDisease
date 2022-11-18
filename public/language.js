$(document).ready(function () {
    console.log("Document ready");
    $('.errormsg').hide();
    var socket = io();
    let bmiField = $("#BMI_text")
    let predictionForm = {
        bmi: -99
    }

    $("#prediction_form").submit(function (e) {
        //todo frontend validation?
        setPredictionForm()

        socket.emit('prediction', predictionForm);
        
        resetFormFields()

        e.preventDefault(); // Do not reload page
    });

    function setPredictionForm(){
        predictionForm.bmi = bmiField.val();

    }

    function resetFormFields(){
        bmiField.val('');
    }

});