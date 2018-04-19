var express     = require('express');
var fs          = require('fs');
var request     = require('request');
var cheerio     = require('cheerio');
var path        = require("path");
var cors        = require('cors');
var app         = express();
var brewery_data = require('./breweries.json');
console.log('***************');

console.log(brewery_data);

const port = process.env.PORT || 8080;
const base_url = 'http://virginiabreweries.com';

var breweries = [];
var brew_count = 0;


app.use(cors());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "./index.html"));
});

//API route to send all of the wineries and their wines. Eventually will be broken out into multiple GET routes
app.get('/api/breweries', function(req, res){
  res.json(brewery_data)
})

//API route to run the harvester and scrape + update all of the wine data
app.get('/harvest', function(req, res){
  let breweries_url = base_url + '/all';
  console.log("Harvesting Breweries");

  request(breweries_url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      // $('#breweries-page').each(function(i, elm) {
      //   console.log(elm);
      //     // let va_wine_url = $(this).children('strong').find('a').attr('href');
      //     let name = $(this).children('h2');
      //     console.log('name:', name);
      //     // let winery_url = $(this).children('.standard-link').text();
      //     // let winery = createWinery(name, winery_url, va_wine_url);
      //
      //     // wineries.push(winery);
      // });

      $('#breweries-page').find('h2').each(function(i, elm) {
        var brewery = {};
        brewery.name = $(this).text().replace(/\s\s+/g, ' ').trim();
        brewery.url = elm.parent.parent.parent.attribs.href;
        console.log("name", brewery.name);
        breweries.push(brewery);
      });
      console.log(breweries);

      // scrapeWineryData(0);

      writeFile();
      res.send('check your winery list')

    }

  })
})


// //Recursive function for scraping all the winery pages and not crash the site :) hopefully
// function scrapeWineryData(index){
//
//   if(index > wineries.length - 1) {
//     return;
//   }
//
//     let url = base_url + wineries[index].va_wine_url;
//
//     request(url, function(error, response, html){
//       if(!error){
//
//         //Scrape the data for the winery page
//         let $ = cheerio.load(html);
//         let region = $('.description h3').text();
//         let phone = $('#phone-card').text();
//
//         //Description needs special attention because its multiple paragraphs
//         let description = "";
//
//         //Loop through the multiple paragraphs, scrape each paragraph, and concatenate with description
//         $('.description').find('p').each(function(i, elm) {
//           paragraphText = $(this).text().replace(/(\r\n|\n|\r)/gm,"").trim();
//           description += paragraphText;
//         });
//
//         //Update the wine array with winery and wine data from the web page
//         wineries[index].description = description;
//         wineries[index].region = region;
//         wineries[index].phone = phone
//
//         //Loop through the wines section of the winery page and grab wine data
//         $('.detail-list-inner-list > li').each(function(i, elm) {
//           let wine_name = $(this).text();
//           let va_wine_url = $(this).find('a').attr('href');;
//           wine_name = wine_name.replace(/(\r\n|\n|\r)/gm,"").trim();
//           wineries[index].wines.push({'name': wine_name, 'va_wine_url': va_wine_url});
//           wine_count += wineries[index].wines.length;
//         });
//
//         var address1 = $('h2').filter(function() {
//           return $(this).text().trim() === 'Location';
//         }).next().text();
//         var address2 = $('h2').filter(function() {
//           return $(this).text().trim() === 'Location';
//         }).next().next().text();
//
//         address = address1 + address2;
//         address = address.replace(/\s\s+/g, ' ');
//         wineries[index].address = address;
//
//         // let address = $('.sidebar > .card > .card-wrapper').find('span');
//         console.log("***************");
//         console.log("address");
//         console.log(address);
//         console.log("***************");
//
//
//         console.log("Success - Harvested " + wineries[index].name + " Information");
//
//         if(index === wineries.length - 1){
//           console.log("Harvested " + wineries.length + " wineries and " + wine_count + " wines.");
//           writeFile();
//         }
//
//         index ++;
//
//         scrapeWineryData(index);
//
//         }
//     })
//   }


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
  fs.writeFile('breweries.json', JSON.stringify(breweries, null, 4), function(err){
    console.log('File successfully written! - Check the project directory for the breweries.json file');
  })
}

app.listen(port)
console.log('Brewery API and Harvester Running on port ' + port + ' ...');
