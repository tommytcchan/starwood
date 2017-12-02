var cheerio = require('cheerio');
var trim = require('trim');

exports.parse = function (params, next) {
  var request = require('request');

  var url = 'https://www.starwoodhotels.com/preferredguest/search/results/detail.html?' + [
    'localeCode=en_US',
    'countryCode=' + params.country,
    'stateCode=' + params.state,
    'city=' + params.city,
    'arrivalDate=' + params.arrivalDate,
    'departureDate=' + params.departureDate
  ].join('&');

  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
    },
    gzip: true,
    json: false
  };

  request(options, function (err, res, html) {
    if (err || res.statusCode !== 200) {
      return next(err || new Error('Network error: ' + res.statusCode), html);
    }

    console.log('error:', err);
    console.log('statusCode:', res && res.statusCode);

    var $ = cheerio.load(html);
    var $results = $('#resultsSecondary');

    if (!$results.length || !$results.find('.property').length)
      return next(new Error('Search results not found'), html);

    var hotels = [];

    $results.find('.property').each(function () {
      var hotel = {};

      if ($(this).data('property-id')) {
        hotel.property_code = $(this).data('property-id');
      }

      if ($(this).find('.propertyImageOuter .propertyImage .propImage').length) {
        hotel.image = 'https://www.starwoodhotels.com' + $(this).find('.propertyImageOuter .propertyImage .propImage').data('backgroundimage');
      }

      if ($(this).find('.propertyDetails .distance').length) {
        var result = $($(this).find('.propertyDetails .distance')[0]).text().trim().split('/')[1].trim().split(' ')[0];
        hotel.location = {
          distanceInMiles: result
        }
      }

      if ($(this).find('.propertyDetails h2').length) {
        hotel.property_name = trim($(this).find('.propertyDetails h2 a').text().split("\n")[0]);
      }

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
        if (hotel.pointsRate === "") {
          hotel.pointsRate = undefined;
        } else {
          hotel.pointsRate = hotel.pointsRate.replace(",", "");
        }
      }


      // only add the hotel though if it's available
      if (hotel.bestRate || hotel.pointsRate) {
        hotels.push(hotel);
      }
    });

    return next(null, hotels);

  });

};
