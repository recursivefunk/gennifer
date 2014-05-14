
```javascript

  var gennifer = require( 'gennifer' );
  var tweetTmpl = function() {
    return {
      user: '@recursivefunk',
      text: 'I am the one'
    };
  };

  gennifer
    .registerTemplate( 'tweet', tweetTmpl )

    // optional
    .usingChannel( anEventEmitter )

    // will return the genrated data and automatically emit the new data
    .generate( 'tweet' );

```