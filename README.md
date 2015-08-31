# Webpack ES6 Express Boilerplate

Express JS boilerplate project to write web applications using ES6 both on client and server.

> NOTE: the project structure derives from `express-generator`

## Features

- ES6 to ES5 transpilation via Babel + polyfill
- Modules bundling via Webpack (with Sourcemaps)
- JS linting via ESLint (with enforced ES6 rules)
- LESS compilation
- Client side tests via Karma, Mocha, Chai, Sinon and PhantomJS (default browser)
- Server side tests via Mocha, Chai and Sinon
- Gulp build system


## Development

```gulp watch```   

Setup watchers on LESS files, client code, server code and tests (both client and server).   
When changing server side code, a new bundle `server.js` is generated in the folder `build`: then server side tests
are run (if the compilation was successful) and, if test are passed, the Node app is restarted.   
When changing client side code, a new bundle `client.js` is generated in the `public/js` folder: then if the build is successful
Karma will run the test.

```gulp build```

Build the files `server.js`, `site.css` and `client.js`. 

```gulp test-server```

Run Mocha to execute the Node tests.

```gulp client-server```

Run Karma to execute the client tests via PhantomJS

## Next steps:
- Define a `production` task to support client js and css minification
- Add support for multiple output files on webpack frontend configuration (in case of different js per page)

    
### Credits
Inspired by http://jlongster.com/Backend-Apps-with-Webpack--Part-I

