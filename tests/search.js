var starwood = require('..');
var utils = require('../lib/utils');

describe('#Starwood', function () {
  describe('#Search', function () {
    it('Should return correct search results', function (done) {
      this.timeout(6000);

      starwood.search({
        city: 'Seattle',
        state: 'WA',
        country: 'US',
        arrivalDate: utils.today(),
        departureDate: utils.tomorrow()
      }, function (err, hotels) {
        if (err)
          return done(err);

        console.log(hotels);

        done();
      });
    });
  });
});