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