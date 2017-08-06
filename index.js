// Require modules here
var Twit = require('twit');
var moment = require('moment');
var Mta = require('mta-gtfs');
var keys = require('../keys/subway_watcher_keys');

// Include global variables here (if any)
var bot = new Twit({
    consumer_key:         keys.TWITTER_CONSUMER_KEY,
    consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
    access_token:         keys.TWITTER_ACCESS_TOKEN,
    access_token_secret:  keys.TWITTER_ACCESS_TOKEN_SECRET
});

var mta = new Mta({
    key: keys.MTA_API_KEY, // only needed for mta.schedule() method
    feed_id: 1                  // optional, default = 1
});

var new_record = {};


exports.handler = function(event, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.
    
    var tweet_options = {
        q: 'MTA OR @NYCTsubway OR (subway AND nyc) -RT',
        count: 100,
        result_type: 'recent',
    };
    
    getTweets(tweet_options)
    .then(getSubwayTimes())
    .then(getSubwayStatus())
    .then(function(){
        // format is callback(error, response);
        callback(null, new_record);
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
                
                var time_difference = time_now.diff(tweet_time, "seconds");
                
                // only get tweets that are less than 60 seconds old
                if (time_difference < 60) {
                    mostest_latest.push(tweet);
                    console.log("Time difference: ", time_difference);
                }
                
            });
            
            // add to the global record
            new_record.tweets = mostest_latest;
            
            resolve();
            return;
            
        });    
    });
}

function getSubwayTimes() {
    return new Promise ((resolve, reject) => {
        mta.schedule(635).then(function (result) {
            console.log(result);
            new_record.times = result;
            resolve();
        });
    });
}

function getSubwayStatus() {
    return new Promise ((resolve, reject) => {
        mta.status('subway').then(function (result) {
            console.log(result);
            new_record.status = result;
            resolve();
        });
    });
}