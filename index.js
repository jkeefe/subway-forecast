// Require modules here
var Twit = require('twit');
var moment = require('moment-timezone');
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
    feed_id: 1             // optional, default = 1; F line is in id 21
});

// var f_train_stops = [167,221,222,223,224,225,226,227,228,229,230,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,267];

var train_line = "1";
var train_stops = [101,103,104,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,142];

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
    
    // could do this as an allPromise, and write once everything comes back.
    
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
                    // console.log("Time difference: ", time_difference);
                }
                
            });
            
            // add to the global record
            console.log("Got tweets.");
            new_record.tweets = mostest_latest;
            
            resolve();
            return;
            
        });    
    });
}

function getSubwayTimes() {
    return new Promise ((resolve, reject) => {
        mta.schedule(train_stops).then(function (result) {
            console.log("Got schedule.");
            
            var now = moment();
            
            new_record.rawdata = result;
            new_record.fetched = {
                "unix": now.format("X"),
                "mills": now.format("x"),
                "utc": now.utc().format("YYYY-MM-DDTHH:mm:ssZ"),
                "nyc": now.tz("America/New_York").format("YYYY-MM-DDTHH:mm:ss"),
                "dow": now.tz("America/New_York").format("e"), // 0-6
                "hour": now.tz("America/New_York").format("H"),
                "min": now.tz("America/New_York").format("m")
            };
            
            new_record.line = {};
            new_record.line[train_line] = {
                "csv_row": {},
                "times": {}
            };
            
            train_stops.forEach((stop_number) => {
                
                var nb_station = stop_number + "N";
                var sb_station = stop_number + "S";
                var nb_minutes = null;
                var sb_minutes = null;
                var nb_delay = null;
                var sb_delay = null;
                
                
                // find the first train in the set that matches train_line
                // and also has an arrival time
                for (var i = 0; i < result.schedule[stop_number].N.length; i++) {
                    
                    if (result.schedule[stop_number].N[i].routeId == train_line && result.schedule[stop_number].N[i].arrivalTime != null) {
                        
                        nb_minutes = moment.unix(result.schedule[stop_number].N[i].arrivalTime).diff(moment.unix(result.updatedOn), 'minutes', true);
                        nb_delay = result.schedule[stop_number].N[i].delay;
                        break;
                    
                    }
                    
                }
                
                for (var j = 0; j < result.schedule[stop_number].S.length; j++) {
                    
                    if (result.schedule[stop_number].S[j].routeId == train_line && result.schedule[stop_number].S[j].arrivalTime != null) {
                        
                        sb_minutes = moment.unix(result.schedule[stop_number].S[j].arrivalTime).diff(moment.unix(result.updatedOn), 'minutes', true);
                        sb_delay = result.schedule[stop_number].S[i].delay;
                        break;
                    
                    }
                    
                }
                
                new_record.line[train_line].times[nb_station] = {
                    "next_train_mins": nb_minutes,
                    "delay": nb_delay
                };
                
                new_record.line[train_line].times[sb_station] = {
                    "next_train_mins": sb_minutes,
                    "delay": sb_delay
                };
                
                new_record.line[train_line].csv_row[`${train_line}_${nb_station}_minutes`] = nb_minutes;
                new_record.line[train_line].csv_row[`${train_line}_${nb_station}_delay`] = nb_delay;
                new_record.line[train_line].csv_row[`${train_line}_${sb_station}_minutes`] = sb_minutes;
                new_record.line[train_line].csv_row[`${train_line}_${sb_station}_delay`] = sb_delay;
                
            });
            
            // console.log(JSON.stringify(new_record.times));
            resolve();
        });
    });
}

function getSubwayStatus() {
    return new Promise ((resolve, reject) => {
        mta.status('subway').then(function (result) {
            console.log("Got statuses.");
            new_record.status = result;
            resolve();
        });
    });
}