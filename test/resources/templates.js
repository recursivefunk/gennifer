
'use strict';

module.exports = function( casual ) {
  return {
    aTweet: function() {
      return {
        create_at: new Date(),
        username: '@' + casual.name
      };
    },

    time: function() {
      return {
        when: Date.now()
      };
    }

  };
};
