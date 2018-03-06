var express     = require('express');
var fs          = require('fs');
var request     = require('request');
var cheerio     = require('cheerio');
var app         = express();
var winery_data = require('./wineries.json');

const port = process.env.PORT || 8080;
const base_url = 'https://www.virginiawine.org';

var wineries = [];
var wine_count = 0;

//API route to send all of the wineries and their wines. Eventually will be broken out into multiple GET routes
app.get('/api/wineries', function(req, res){
  res.json(winery_data)
})

//API route to run the harvester and scrape + update all of the wine data
app.get('/harvest', function(req, res){
  let wineries_url = base_url + '/wineries/all';

  request(wineries_url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      $('.standard-list > li').each(function(i, elm) {
          let va_wine_url = $(this).children('strong').find('a').attr('href');
          let name = $(this).children('strong').text();
          let winery_url = $(this).children('.standard-link').text();
          let winery = createWinery(name, winery_url, va_wine_url);

          wineries.push(winery);
      });

      scrapeWineryData(0);

      res.send('check your winery list')

    }

  })
})


//Recursive function for scraping all the winery pages and not crash the site :) hopefully
function scrapeWineryData(index){

  if(index > wineries.length - 1) {
    return;
  }

    let url = base_url + wineries[index].va_wine_url;

    request(url, function(error, response, html){
      if(!error){

        //Scrape the data for the winery page
        let $ = cheerio.load(html);
        let region = $('.description h3').text();
        let phone = $('#phone-card').text();

        //Description needs special attention because its multiple paragraphs
        let description = "";

        //Loop through the multiple paragraphs, scrape each paragraph, and concatenate with description
        $('.description').find('p').each(function(i, elm) {
          paragraphText = $(this).text().replace(/(\r\n|\n|\r)/gm,"").trim();
          description += paragraphText;
        });

        //Update the wine array with winery and wine data from the web page
        wineries[index].description = description;
        wineries[index].region = region;
        wineries[index].phone = phone

        //Loop through the wines section of the winery page and grab wine data
        $('.detail-list-inner-list > li').each(function(i, elm) {
          let wine_name = $(this).text();
          let va_wine_url = $(this).find('a').attr('href');;
          wine_name = wine_name.replace(/(\r\n|\n|\r)/gm,"").trim();
          wineries[index].wines.push({'name': wine_name, 'va_wine_url': va_wine_url});
          wine_count += wineries[index].wines.length;
        });

        console.log("Success - Harvested " + wineries[index].name + " Information");

        if(index === wineries.length - 1){
          console.log("Harvested " + wineries.length + " wineries and " + wine_count + " wines.");
          writeFile();
        }

        index ++;

        scrapeWineryData(index);

        }
    })
  }


function createWinery(name, winery_url, va_wine_url) {
  let winery = {};
  winery.name = name;
  winery.winery_url = winery_url;
  winery.va_wine_url = va_wine_url;
  winery.phone = null;
  winery.address = null;
  winery.region = null;
  winery.description = null;
  winery.wines = [];
  return winery;
}

function writeFile(){
  fs.writeFile('wineries.json', JSON.stringify(wineries, null, 4), function(err){
    console.log('File successfully written! - Check the project directory for the wineries.json file');
  })
}

app.listen(port)
console.log('Wine API and Harvester Running on port ' + port + ' ...');
