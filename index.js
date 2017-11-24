var starwood = require('./lib/starwood');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

  var data = {
        city: req.city,
        state: req.state,
        country: req.country,
        arrivalDate: req.arrivalDate,
        departureDate: req.departureDate
      };

  starwood.search(data, function (err, hotels) {
    if (err) {
      res.send({error: "Unable to parse hotel"});
      return;
    }
    console.log(hotels);
    res.send(hotels);
  });
});

module.exports = router;
