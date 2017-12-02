var express = require('express');
var parser = require('./lib/parser');

const app = express();


app.get('/', function (req, res) {
  var params = {
    city: req.query.city,
    state: req.query.state,
    country: req.query.country,
    arrivalDate: req.query.arrivalDate,
    departureDate: req.query.departureDate
  };

  parser.parse(params, function (err, hotels) {
    if (err) {
      console.log(err);
      res.send({error: "Unable to parse hotels. " + err});
      return;
    }
    console.log("Sending hotel results");
    res.json(hotels);

  });
});

app.listen(18080, () => console.log('Starwoods API listening on port 8080!'));
