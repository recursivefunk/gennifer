### Deps
```
  npm install
```

### Usage & installation
#### As a module
```
  npm install gennifer --save
```
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
#### As a standalone-socket server
```
  [sudo] npm install -g gennifer
  genneifer [ -f 1000 -v 1 -p 8080 ]
```
Just type
```
  genneifer
```
For available options

### On Dates & Strings
There's no good way to distinguish between a string that's a number and a date string. For Instance '1' is a "valid date", but in the context of an application, probably is not actually representative of any point in time. To remedy this, you'd have to override the property to manually set the data type. See usage below:

```javascript
  var obj = { foo: 'bar', created_at: 'Fri Oct 24 23:22:09 +0000 2008' };
  var decoded = genneifer.resolveTypes( obj, { created_at: 'Date' } );
  console.log( decoded ); // { foo: 'String', created_at: 'Date' }
```
When gennifer sees this property, she will use the overridden type. This obviously isn't the ideal situation as it forces you to at least know a bit about the data ahead of time, but such is the world in which we live.

### Run Tests
```
  npm test
```

### To Do
Check the issues section
