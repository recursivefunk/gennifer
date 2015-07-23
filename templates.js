
'use strict';

module.exports = function( casual ) {
  return {
    nameDate: function() {
      return {
        date: casual.date,
        name: casual.name
      };
    }
  };
};
