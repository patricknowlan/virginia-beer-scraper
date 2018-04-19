virginia-brewery-api
================

JavaScript harvester and API to extract the brewery and beer list out of the HTML web pages found on http://virginiabreweries.com/ and convert it into JSON. This code will scrape and convert most of the data on virginia wineries and wines into json so that it can be used in awesome coding projects! Please run this code with caution because it will send hundreds of web requests to their website so please scrape and drink beer responsibly.

## Running the code

``` shell
$ npm install
$ node server.js
```

The node server will start up, navigate to http://localhost:8080/harvest and to harvest the winery/wine list. Then go to http://localhost:8080/api/breweries to GET the full list of data via an API route.

## Data
The data is also available to just grab and will be updated frequently. If you so please you can download all of the winery/wine data in the breweries.json file.


## Cheers
![Cheers](https://media.giphy.com/media/10pVtJi0VzADHa/giphy.gif)
