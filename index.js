// Require modules here
var Twit = require('twit');
var moment = require('moment');
var keys = require('../keys/subway_watcher_keys');

// Include global variables here (if any)
var bot = new Twit({
    consumer_key:         keys.TWITTER_CONSUMER_KEY,
    consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
    access_token:         keys.TWITTER_ACCESS_TOKEN,
    access_token_secret:  keys.TWITTER_ACCESS_TOKEN_SECRET
});

exports.handler = function(event, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.
    
    var today = moment().format("YYYY-MM-DD");
    // var today = "2017-03-13";
    
    var tweet_options = {
        q: 'MTA OR @NYCTsubway OR (subway AND nyc) -RT',
        count: 100,
        result_type: 'recent',
    };
    
    getTweets(tweet_options)
    .then(function(tweet_list){
        
        // format is callback(error, response);
        callback(null, tweet_list);
        
    })
    .catch(function(){
        console.log("Promise problem!");
        callback("Promise Error!");
    });
        

};

// Helper functions can go here
function getTweets(options) {
    return new Promise((resolve, reject) => {
        
        bot.get('search/tweets', options, function(err, data, response) {
            
            if (err){
                console.log("Twitter error:", err);
                reject(err);
                return null;
            }
            
            var mostest_latest = [];
            var time_now = moment();
            
            data.statuses.forEach(function(tweet){
                
                // Tweet time created_at format: Sun Aug 06 18:14:56 +0000 2017
                var tweet_time = moment(tweet.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY");
                console.log("here", tweet_time);
                
                var time_difference = time_now.diff(tweet_time, "seconds");
                
                if (time_difference < 60) {
                    mostest_latest.push(tweet);
                    console.log("Time difference: ", time_difference);
                }
                
            });
            
            resolve(mostest_latest);
            return;
            
        });    
    });
}