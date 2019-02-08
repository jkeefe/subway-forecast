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

## Size calculation

Storage: 50 GB
One record set: ~0.5MB

Minutes in a day: 1440
So 50 GB gets us ~ 69 days

One day is 720 MB

So a year is about 262GB


Minutes in a year: 525600
525600 * 0.5MB = 

Each set is ~5000 rows
Max primary key integer: 4294967295

will max out the primary key integer at 858993 sets (about a year and a half)

## Async / Await

Trying this for the first time: https://javascript.info/async-await

Dreamy!

## Lambda deploy with claudia

- Made IAM role for this `ai-studio-lambda-rds`, including cloudwatch and RDS perms
- Followed the instructions here, too: https://docs.aws.amazon.com/lambda/latest/dg/vpc-rds.html
- matched the region to the RDS server
- had to load the environments into my local setup using `export` for claudia to build right


```
./node_modules/.bin/claudia create --region us-east-2 --handler index.handler --role ai-studio-lambda-rds --runtime nodejs8.10 --timeout 15 --name ai-studio-subway-forecast
```

- In the lambda console:
    - Picked the default VPN that matched the RDS instance
    - Picked 3 subnets that matched the RDS instance
    - picked the security group that matches the RDS instance
    
## VPC land

Looks like I'll need to do this stuff to make my lambda function run on inside the VPC and have access to the internet: https://aws.amazon.com/premiumsupport/knowledge-center/internet-access-lambda-function/ <- caution, you basically need to follow this from the bottom up.

- Created VPC in the console
- name: ai-studio-vpc
- IPv4 CIDR block: 10.0.0.0/16
- public subnet; 10.0.1.0/24
- private subnet: 10.0.2.0/24
- made sure private subnet in same availability zone as the RDS instance
- then needed to create an Internet Gateway  
    - associate it with the vpn
    - now it has an id of `igw-...`
- then needed to add that to a route table 
    
```
Choose Edit, and then choose Add another route.
Destination: 0.0.0.0/0
Target:
For a private subnet with a NAT instance: eni-…
For a private subnet with a NAT gateway: nat-…
For a public subnet: igw-…
```
- in RDS had to make a subnet group based on the ai-studio-vpc
- switched the DB instance over to the AI studio vpc

Got this error in RDS:

```
Cannot create a publicly accessible DBInstance. The specified VPC does not support DNS resolution, DNS hostnames, or both. Update the VPC and then try again
```

So had to do this:

```
    To describe and update DNS support for a VPC using the console

    Open the Amazon VPC console at https://console.aws.amazon.com/vpc/.

    In the navigation pane, choose Your VPCs.

    Select the VPC from the list.

    Review the information in the Summary tab. In this example, both settings are enabled.


                  The DNS Settings tab
                
    To update these settings, choose Actions and either Edit DNS Resolution or Edit DNS Hostnames. In the dialog box that opens, choose Yes or No, and then choose Save.

```

OK, trying this from scratch in the Ohio Region (us-east-2) to make a step-by-step (also because we were hitting limits)

## VPC Setup

First, the VPC: 

- AWS Console
- Set region to "Ohio" at top `us-east-2`
- Went to VPCs

### Making the oveall VPC

- Create VPC   
    - named it: `ai-studio-vpc`
    - gave it IPv4 block: 10.0.0.0/16
    - left the rest as defaults
    - back at the VPC console, selected my new vpc
    - These next steps are needed if your RDS instance is going to be public, like mine:
        - hit "Actions" button
        - "Edit DNS resolution"
        - Enable if it's not
        - Save
        - hit "Actions" button
        - "Edit DNS hostnames"
        - Enable if it's not
        - Save
    
### Subnets    
    
- Subnets
    - Create Subnet
    - ai-studio-subnet-private-1
        - VPC: ai-studio-vpc
        - Availability zone: `us-east-2a` <- Kept these all the same
        - IPv4 block: 10.0.1.0/24
    - ai-studio-subnet-private-2
        - VPC: ai-studio-vpc
        - Availability zone: `us-east-2a`
        - IPv4 block: 10.0.2.0/24
    - ai-studio-subnet-private-3
        - VPC: ai-studio-vpc
        - Availability zone: `us-east-2b` <- RDS wants at least one in another zone
        - IPv4 block: 10.0.4.0/24         <- this is randomly out of order sorry
    - ai-studio-subnet-public-1
        - VPC: ai-studio-vpc
        - Availability zone: `us-east-2a`
        - IPv4 block: 10.0.3.0/24
        
If you plan to put a publicly-reachable EC2 instance inside one (or both) of the subnets labeled "public," you also have to do this so they get a public IP address reachable inside the VPC:

- Open the Amazon VPC console at https://console.aws.amazon.com/vpc/.
- In the navigation pane, choose Subnets.
- Select your subnet and choose Subnet Actions, Modify auto-assign IP settings.
- The Enable auto-assign public IPv4 address check box, if selected, requests a public IPv4 address for all instances launched into the selected subnet. Select or clear the check box as required, and then choose Save.

More on this here: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ip-addressing.html 

Note that none of the subnets are currently either public or private (well, they're all private). We'll change that with the route table. But need a gateway first.
        
### Internet Gateway

First we need to establish an internet gateway for the VPC. This is a necessary before making an NAT Gateway, it seems.

- Internet Gateways
- Create Internet gateway
- Gave it a name `ai-studio-internet-gateway`
- Then back on the Internet Gateway dashboard:
    - Select the new (not attached) gateway
    - Actions Button -> Attach VPC
    - Pick the ai-studio-vpc
        
### NAT Gateway
        
Because I want my lambda function to be able to work in the VPC *and* get out to the internet, I need to attach an NAT Gateway to the public subnet. See: https://aws.amazon.com/premiumsupport/knowledge-center/internet-access-lambda-function/

Note that the language here gets confusing about whether the NAT goes on the private subnet. But the tables are pretty clear here: https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html

Still in the VPC console:

- NAT Gateways
- Create NAT Gateway
- Pick a subnet. This looks to be the **public** subnet, where it "lives." Annoyingly, the dropdown doesn't have the subnet names, so had to go back and get the id for my public subnet.
- Elastic IP allocation -> Create New EIP (note you only get 5 per region)
- Then used "Edit Route Tables" button

### Route Tables

So to use the NAT Gateway, I need route tables. 

One table will be for public subnets, one table will be for private subnets. 

- Create Route Table
    - Named first one: ai-studio for private subnets
    - VPC: ai-studio-vpc
- Created another
    - Named first one: ai-studio for public subnets
    - VPC: ai-studio-vpc
    
OK, now ... this is a little strange ... but the route *used for the private subnets* (where to go next) points (routes) to the NAT Gateway in the *pubic* subnet.

- Highlighted the ai-studio for *private* subnets
- Picked the "Routes" tab below
- Clicked "Edit routes"
- One is already there: `10.0.0.0/16 local active`
- Add Destination: 0.0.0.0/0
- It'll say "no results found"  ... I just tabbed over to the next box
- Target: id of the NAT Gateway (again, no "names" in the dropdown, so I had to go back and get the ID). This should begin with `nat-`

- Back at the Route Table dashboard
- Highlighted the ai-studio for *public* subnets
- Picked the "Routes" tab below
- Clicked "Edit routes"
- One is already there: `10.0.0.0/16 local active`
- Add Destination: 0.0.0.0/0 
- It'll say "no results found"  ... I just tabbed over to the next box
- Target: This time, it's the internet gateway I just made, which starts with `igw-`

Back at the Route Table dashboard I made the `ai-studio for private subnets` as a "main table" -- based on that drawing above, and some other info.

- Selected the `ai-studio for private subnets` route
- Hit the "Actions" button
- Picked "Set Main Route Table"

I also like the approach of making separate subnets to use in the Lambda instance, as described in [this Medium post](https://medium.com/@philippholly/aws-lambda-enable-outgoing-internet-access-within-vpc-8dd250e11e12). Though I didn't do that here. I'll just associate it with the private subnets. 

- Head over to the Subnets console (from the left column)
- Click individually on each one and then on the "Route Table" tab
- All the "private" subnets should show the `ai-studio for private subnets` table
    - Remember, the second entry on the table should have a target that starts `nat-...`
- But the "public" subnet/s should show the one for `public subnets`
    - Remember, the second entry on the table should have a target that starts `igw-...`
- If they need to be changed, click "Edit route table association" and pick the right table (by ID, not name, alas)

## RDS - MySQL

- AWS Console
- RDS
- Engine: MySQL
- Dev/Test (I don't need this is a bunch of availability zones)
- Allocated Storage: 200GB (nearly a year of data)
- named it
- username
- password
- defaults
- Yes to "Public accessibility" - so we can get at the data from our laptops, etc.
- Availability zone: `us-east-2a` just like all the subnets
- Create new VPC Security Group (tho I'll go edit that later)
- Database name: subways
- default settings until
- Maintenance -> Select window. Picked at time that is *not* during NYC subway rush hour. Note it's in UTC.
- Created database
- Waited a few minutes
- Got the updated description of the database
- Clicked on the security group that was added automatically to name it
- Noted the endpoint, which I'll need for connecting in the code

## Lambda

The build of the lambda function is above, but to get it in the right region I had to deploy it to `us-east-2` with this command: 

```
./node_modules/.bin/claudia create --region us-east-2 --handler index.handler --role ai-studio-lambda-rds --runtime nodejs8.10 --timeout 15 --name ai-studio-subway-forecast
```


# Observations

- Check out morning of Tuesday, Jan 22 :
    - [8:45 AM] Downtown 6 trains are massively crowded/delayed today
    - [8:58 AM] Lots of A/C delays too because of an issue at Jay Street
- Wednesday, Jan 23: Water main break at 14th and 7th Ave
    - [7:15 AM] From: Notify NYC Due to a reported water main break, L train service is suspended between 8th Avenue, Manhattan and Bedford Avenue, Brooklyn in both directions. http://www.mta.info .  http://on.nyc.gov/2gFqaVT
    - [8:10 AM] I’m now on the E after being diverted and this is delayed. Sigh  LOL I love the subway. God bless the MTA.
    - [9:08 AM] Just heard over intercom still no L from Union square to 8th.
    - [9:13 AM] Yeah it just took me 2 hours door to door. So good luck
- Monday, Jan 28
    - [9:13 AM] While I’m waiting on a C train whose arrival time is “Delay,” thought I’d let you know (Franklin St./ N-bound toward Manhattan)
- January 29
    - 7:31 am on S-bound A at 175 "due to a stalled N-bound train we have delays in S-bound service." my train totally packed. 
    - [9:31 AM] A/C is currently the Fyre Festival of train lines
- February 8
    - [8:45 AM] “Heavy smoke condition at 2nd Ave.” F trains being held in stations behind it back toward Brooklyn.
    - [8:48 AM] A/C is crawling because either we’re about to start traveling the 6th ave line or the F is about to start traveling our 8th ave line, it’s unclear!
    - [8:50 AM] “Waiting for the FDNY to arrive at the station.” Sounds like this is going to go on for awhile.

TODO: 
- Add more error handling
- Write raw data to S3 using snapshot time as key
- In another table, store tweets/min using snapshot time as key

Each public subnet needs a route table that includes the Internet Gateway

Each private subnet needs a _different_ route table that doesn't.


    
    
    
    
    
