### Deps
```
  npm install
```

### Usage
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

### Run Tests
```
  npm test
```

### To Do
Register templates in bulk
  - String that points to a directory of templates with one template per file
  - String that points to a single file with many templates
  - An object directly with multiple templates
  - A way to take an API response from a service and construct a template based
    on that alone (this is huge)

Other Stuff
  - Finish ignore channel functionality
  - A built in transform function to modify a generated dataset to simulate
    how grandstand changes data
  - Configure from the client via sockets :)