var cheerio = require('cheerio');
var debug = require('debug')('starwood');
var trim = require('trim');
var utils = require('./utils');

// Request host
exports.host = 'https://www.starwoodhotels.com/';

// Request rules, contains request.headers
// `all` means this kind of rule will be append to request's option
// in both `GET`, `POST` ,`PUT`, `DELETE` methods.
exports.rules = {
  all: {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, sdch',
      'Accept-Language': 'en-US,en;q=0.8,en;q=0.6,zh-TW;q=0.4,ja;q=0.2,de;q=0.2',
      'Host': 'www.starwoodhotels.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
      'Referer': 'https://www.starwoodhotels.com/preferredguest/index.html?language=en_US'
    },
    gzip: true,
    json: false
  }
};

exports.routes = {
  // Seach hotels information from SPG's website.
  search: {
    url: '/preferredguest/search/results/detail.html?' + [
      'searchType=city',
      'localeCode={{lang|default("en_US")}}',
      'countryCode={{country|default("US")}}',
      'stateCode={{state}}',
      'city={{city}}',
      'arrivalDate={{arrivalDate}}',
      'departureDate={{departureDate}}'
    ].join('&'),
    callback: function (err, res, html, next) {
      if (err || res.statusCode !== 200)
        return next(err || new Error('Network error: ' + res.statusCode), html);

      var $ = cheerio.load(html);
      var $results = $('#resultsSecondary');

      if (!$results.length || !$results.find('.property').length)
        return next(new Error('Search results not found'), html);

      var hotels = [];

      $results.find('.property').each(function () {
        var hotel = {};

        if ($(this).data('property-id'))
          hotel.id = $(this).data('property-id');

        if ($(this).find('.propertyDetails .propertyImage .propImage').length)
          hotel.thumbnail = $(this).find('.propertyDetails .propertyImage .propImage').data('backgroundimage');

        if ($(this).find('.propertyDetails h2').length)
          hotel.name = trim($(this).find('.propertyDetails h2 a').text().split("\n")[0]);

        if ($(this).find('.propertyDetails .propertyLocation').length) {
          var addressParts = $(this).find('.propertyDetails .propertyLocation').text().split(",");

          hotel.city = trim(addressParts[0]);
          hotel.state = trim(addressParts[1]);
          hotel.country = trim(addressParts[2]);

        }

        if ($(this).find('.propertyDetails .spgCategory').length) {
          hotel.category = $($(this).find('.propertyDetails .spgCategory')[0]).text();
        }


        if ($(this).find('.rateOptions').length) {
          hotel.bestRate = $(this).find('.rateOptions .currency').text().split(" ")[1];
          hotel.pointsRate = $(this).find('.rateOptions .starPoints').text().split(" ")[0];
        }

        debug(hotel);

        hotels.push(hotel);
      });

      return next(null, hotels);
    }
  }
};