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

### On Dates & Strings
There's no good way to distinguish between a string that's a number and a date string. For Instance '1' is a "valid date", but in the context of an application, probably is not actually representative of any point in time. To remedy this, you'd have to override the property to manually set the data type. See usage below:

```javascript
  var obj = { foo: 'bar', create_at: 'Fri Oct 24 23:22:09 +0000 2008' };
  var decoded = genneifer.resolveTypes( obj, { created_at: 'Date' } );
  console.log( decoded ); // { foo: 'String', create_at: 'Date' }
```
When gennifer sees this property, she will use the overridden type. This obviously isn't the ideal situation as it forces you to at least know a bit about the data ahead of time, but such is the world in which we live.

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