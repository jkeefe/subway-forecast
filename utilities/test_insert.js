var mysql = require('mysql');
var keys = require('../../keys/subway_watcher_keys');

var connection = mysql.createConnection({
    host: keys.DB_ENDPOINT,
    user: keys.DB_USER,
    password: keys.DB_PASS,
    database: "subways"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
    var sql = 'INSERT INTO traintimes (snapshotUTC, snapshotNYC, snapshotUnix, routeId, stationIdGTFS, direction, trainOrderLine, trainOrderAll, arrivalTime, departureTime, updatedOn, timeToArrival, timeToDeparture) VALUES ?';
    
    var values = [];
    
    var record = 
    
    
    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Result: " + result);
        connection.end(function(err) {
            console.log("Connection closed.");
        });
    });
});