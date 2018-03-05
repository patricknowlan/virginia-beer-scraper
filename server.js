var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

const base_url = 'https://www.virginiawine.org';
var wineries = [];



app.get('/scrape', function(req, res){
  // Let's scrape Anchorman 2
  let wineries_url = base_url + '/wineries/all';

  request(wineries_url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      let test1 = $('.standard-list > li').html();
      console.log('TESTONE', test1);

      $('.standard-list > li').each(function(i, elm) {
          let va_wine_url = $(this).children('strong').find('a').attr('href');
          let name = $(this).children('strong').text();
          let winery_url = $(this).children('.standard-link').text();
          let winery = createWinery(name, winery_url, va_wine_url);
          // console.log($(this).text());
          wineries.push(winery);
      });

      // console.log(wineries);

      scrapeWineryData(0);

      res.send('check your winery list')

    }

  })
})

function createWineryList(){

}

function scrapeWineryData(index){

  if(index > 2) {
    return;
  }

    let url = base_url + wineries[index].va_wine_url;

    request(url, function(error, response, html){
      if(!error){
        let $ = cheerio.load(html);
        let descriptionHTML = $('.description').html();
        let region = $('.description h3').text()
        let description = $('.description').find('p')[1].children[0].data;
        console.log("DESCRIPTION", description);

        // let test = $('.detail-list-inner-list > li').text();
        // console.log("TEST", test);


        $('.detail-list-inner-list > li').each(function(i, elm) {
          let wine_name = $(this).text();
          wine_name = wine_name.replace(/(\r\n|\n|\r)/gm,"").trim();
          let va_wine_url = $(this).find('a').attr('href');;
          console.log('WINE', wine_name);
          console.log('URL', va_wine_url);
          wineries[index].wines.push({'name': wine_name, 'va_wine_url': va_wine_url});

        });



        console.log("***********************************************************");

        wineries[index].description = description;
        wineries[index].region = region;
        console.log(wineries[index]);

        if(index === 2){
          writeFile();
        }

        index ++;

        scrapeWineryData(index);


        }
    })
  }


function createWinery(name, winery_url, va_wine_url, phone, address) {
  let winery = {};
  winery.name = name;
  winery.winery_url = winery_url;
  winery.va_wine_url = va_wine_url;
  winery.phone = phone;
  winery.address = address;
  winery.region = null;
  winery.description = null;
  winery.wines = [];
  return winery;
}

function writeFile(){
  fs.writeFile('output.json', JSON.stringify(wineries, null, 4), function(err){
    console.log('File successfully written! - Check your project directory for the output.json file');
  })
}

app.listen('8081')
console.log('Wine Scraper Server Running on port 8081 ...');
