var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
  // Let's scrape Anchorman 2
  url = 'https://www.virginiawine.org/wineries/all';

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      var wineries = [];

      $('.standard-list > li').each(function(i, elm) {
          let name = $(this).children('strong').text();
          let winery_url = $(this).children('.standard-link').text();
          let winery = createWinery(name, winery_url);
          console.log($(this).text());
          wineries.push(winery);
      });

      console.log(wineries);
    }

    fs.writeFile('output.json', JSON.stringify(wineries, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');

      res.send('check your winery list')

    })

  })
})

function createWinery(name, winery_url, phone, address) {
  let winery = {};
  winery.name = name;
  winery.winery_url = winery_url;
  winery.phone = phone;
  winery.address = address;
  return winery;
}

app.listen('8081')
console.log('Wine Scraper Server Running on port 8081 ...');
