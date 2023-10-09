# No web frameworks

This set of examples show that in many cases you do not need to use any web frameworks, the standard HTML, CSS and JavaScript may provide you enough functionality to accomplish the task.

Code was prepared as examples for talk [The Death of Web Frameworks](https://www.openslava.sk/2023/#/program/7ab4cf0f-48ea-445d-87c1-a55c9548130b)
on OpenSlava 2023 conference.

## Quick start

1. Clone this project and change directory to cloned code.
1. Download all dependencies and tools with `npm install`. This script will also create ES6 modules from all the dependencies in directory `web_modules` (postinstall script).
1. Run `npm start`.
1. In browser select `http://localhost:8080` URL and try out example applications.
1. Explore source code of the examples in subdirectory `./public`.

## Development

To run the example service for debugging and development of the server-side code you can use `npm run dev` script.

![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)

For cleanup of the code you may use `npm run fix`. To validate the conformance with [standard JS styleguide](https://standardjs.com/rules.html) you may run `npm test` script.

This code contains tiny "tool" [tools/bundleDependencies.js](.tools/bundleDependencies.js) that converts all legacy libraries from NPM into ES6 modules. The code runs by installing / updating dependencies from NPM. You may run it manually with script `npm run dependencies`.