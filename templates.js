
'use strict';

var casual = require( 'casual' );

module.exports = {
  aTemplate: function() {
    return {
      date: casual.date,
      name: casual.name
    }
  }
}
