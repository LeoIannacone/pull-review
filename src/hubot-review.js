var Promise = require('native-promise-only');

var Request = require('./request');
var Review = require('./review');
var Response = require('./response');

function HubotReview (options) {
  var text = options.text;
  var adapter = options.adapter;
  var room = options.room;

  return Promise.resolve()
    .then(function () {
      var request = Request({
        'text': text,
        'room': room
      });

      var review = Review({
        'request': request
      });

      var response = Response({
        'adapter': adapter,
        'request': request,
        'review': review
      });

      return response;
    });
}

module.exports = HubotReview;