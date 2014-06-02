
'use strict';

var casual = require( 'casual' );

module.exports = {

  aTweet: function() {
    return {
      create_at: new Date(),
      username: '@' + casual.name
    };
  }

};