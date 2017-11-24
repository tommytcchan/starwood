var starwood = require('..');

starwood.search({
  city: 'Seattle',
  state: 'WA',
  country: 'US',
  arrivalDate: '02/14/2018',
  departureDate: '02/16/2018'
}, function(err, hotels){
  if (err) 
    return console.error(err);
});
