var app = require('./index.js');

var send_to_app = "hello!";

app.handler(send_to_app, null, function(error, result){
    
    result.forEach(function(tweet){
        console.log(tweet.created_at);
        console.log(tweet.text);
    }); 
    console.log("Tweets = ", result.length);
});
