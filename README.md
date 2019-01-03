# Context queries

`<context-style>` is a HTML custom element that allows developers to write context dependent style sheets with the utterly known CSS syntax. It builds upon the idea of media queries, where breakpoints are set to define different style rules. Media queries are mainly based on the viewport whereas Context-Style integrates some of the still in development Web APIs like DeviceLightEvent and DeviceMotionEvent to determine the context in which the users are.


#### Supported features:

`light-intensity`, `touch`, `time`, `battery`, `charging-battery`


#### Usage

Copy the minified javascript file in /dist then and it in the Head Tag like this:

    <head>
        ...
        <script src="path-to-your-js-files/context.min.js"></script>
        ...
    </head>

Web Components need a Polyfill depending on the browser, include the polyfill before you import the custom context element, see more on [https://github.com/webcomponents](https://github.com/webcomponents "Webcomponents")

`<script src="https://unpkg.com/@webcomponents/webcomponentsjs@^2/webcomponents-bundle.js"></script>`

Write your styles using the @context rule on a separate css file and link them with the "href" attribute 

`<context-style href="your-context-styles.css"></context-style>`

or directly in the custom element, you can use "min-" and "max-" prefixes or range contexts, see more on [Evaluating Media Features](https://www.w3.org/TR/mediaqueries-4/#mq-range-context "Media Queries Level 4")

    <context-style>
        @context (30 <= light-intensity <= 70) {
            body { background-color: #eee}
            .class { background-color: #666; color: red }
        }
    </context-style>


#### Run the examples locally:

To view the examples clone the repository first. To install the dependencies open your favourite shell and run:

`npm install`

to start the server run:

`npm run serve`

open your browser and go to one of the listed addresses, usually [http://127.0.0.1:8080](http://127.0.0.1:8080) does the trick.
