var app = require('./index.js');
var fs = require('fs');

var send_to_app = "hello!";

app.handler(send_to_app, null, function(error, result){
    
    var data = JSON.stringify(result);
    
    // console.log(data);
    
    fs.writeFile("data/example_calcs.json", data, function(err) {
    
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }); 
    
});
