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
    var sql = 'CREATE TABLE traintimes (id INT AUTO_INCREMENT PRIMARY KEY, snapshotUTC DATETIME NOT NULL, snapshotNYC DATETIME NOT NULL, snapshotUnix INT(10) UNSIGNED NOT NULL, routeId VARCHAR(3) NOT NULL, stationIdGTFS VARCHAR(3) NOT NULL, direction CHAR(1), trainOrderLine TINYINT, trainOrderAll TINYINT, arrivalTime INT(10) UNSIGNED, departureTime INT(10) UNSIGNED, updatedOn INT(10) UNSIGNED, timeToArrival SMALLINT, timeToDeparture SMALLINT) DEFAULT CHARSET=utf8';
    
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
        connection.end(function(err) {
            console.log("Connection closed");
        });
    });
});