var starwood = require('./lib/starwood');
var express = require('express');

const app = express();

app.listen(8080, () => console.log('Starwoods API listening on port 8080!'));

app.get('/', function (req, res) {

  var data = {
    city: req.query.city,
    state: req.query.state,
    country: req.query.country,
    arrivalDate: req.query.arrivalDate,
    departureDate: req.query.departureDate
  };

  starwood.search(data, function (err, hotels) {
    if (err) {
      console.log(err);
      res.send({error: "Unable to parse hotels. " + err});
      return;
    }
    console.log(hotels);
    res.send(hotels);
  });
});

