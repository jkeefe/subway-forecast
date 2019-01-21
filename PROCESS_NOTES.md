# Subway Forecast Notes

This is where I keep notes on my process as I go through it.

## Roadmap

- Every minute check:

    - Live train status at every station

    - Tweets since X period mentioning
        - A train
        - B train
        - C train
        - D train 
        - E train
        - F train 
        - L train 
        - M train
        - N train
        - Q train
        - R train
        - W train
        - Delay? Fire? Smoke? Crash? Other words of trouble? Anger? Frustration? All almost tweets like this?
    - Use [tweets/search](https://dev.twitter.com/rest/reference/get/search/tweets) for this
        - q: 
        - result_type: "recent"
        - count: 100
        - since_id:     
    - Filter by last captured tweet, but also limit to last minute of tweets (since might have break overnight/weekends)

    - count of those tweets

    - Tweets by official mta account

    - Status page for each train

    - time stamp

    - day of week 

- Stick into mongodb database

Assuming that page status is the indicator of actual problems. Tho tweet volume could be. 

Does the live train data predict tweets?

## Getting MTA Live Data

Live data feeds here: http://datamine.mta.info/list-of-feeds

**note!** the line IDs are actually at the _end of the url_ ... so the fourth listed item, B D F M lines, is http://datamine.mta.info/mta_esi.php?key=key&feed_id=21 which is *21**

1-2-3-4-5-6 train data is this: http://datamine.mta.info/mta_esi.php?key=API_KEY_HERE&feed_id=1

Downloads a GTFS file. 

Oooh, this looks particularly helpful: https://github.com/BlinkTagInc/node-gtfs
Or this: https://github.com/aamaliaa/mta-gtfs

^^ using this one

To get at the time to the next train, need to take the difference of the `arrivalTime` and `updatedOn` in minutes. And they're in UNIX time. So like this:

```
> moment.unix(1502055832)
moment("2017-08-06T17:43:52.000")
> moment.unix(1502055832).diff(moment.unix(1502056066), 'minutes')
-3
> moment.unix(1502055832).diff(moment.unix(1502056492), 'minutes')
-11
```

## Historical Data

IRT lines only

http://web.mta.info/developers/MTA-Subway-Time-historical-data.html

## Station info:

http://web.mta.info/developers/data/nyct/subway/Stations.csv

## Database ...

Looking into storing this all in RDS / MySQL on Amazon web services -- partly because then I can just import the data directly from AWS into a pandas dataframe. See this: https://datascience-enthusiast.com/R/AWS_RDS_R_Python.html

Initially going to have a whole ton of columns in the MySQL database -- essentially one row for each snapshot in the entire system: 

(see data/possible-columns.json)

Instead, how about keeping every station-direction-line-timestamp time ... allowing us to construct the data table as we need it.

So we could actually build that table above from snapshot-grouped queries of the following:

    snapshotUTC: DATETIME ${snapshotUTC}
    snapshotNYC: DATETIME ${snapshotNYC}
    snapshotUnix: INTEGER ${snapshotUnix}
    routeId: VARCHAR(3) ${train.routeId}
    stationIdGTFS: VARCHAR(3) ${stop_number}
    direction: CHAR(1) ${direction}
    trainOrderLine: TINYINT ${trainLineOrders[train.routeId]}
    trainOrderAll: TINYINT ${i}
    arrivalTime: INTEGER ${train.arrivalTime}
    departureTime: INTEGER ${train.departureTime}
    updatedOn: INTEGER ${result.updatedOn}
    timeToArrival: INTEGER ${time_to_arrival}
    timeToDeparture: INTEGER ${time_to_departure}
    
Also remember that if we build these in pandas, with station-direction-line columns, missing values will be null, which is nice.

MySQL W3Schools tutorial! https://www.w3schools.com/nodejs/nodejs_mysql_insert.asp



    


    
    
    
    