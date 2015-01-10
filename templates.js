
'use strict';

var casual = require( 'casual' );

module.exports = {
  nameDate: function() {
    return {
      date: casual.date,
      name: casual.name
    };
  }
};
