!function(e){function r(e,r,t){e in l||(l[e]={name:e,declarative:!0,deps:r,declare:t,normalizedDeps:r})}function t(e){return p[e]||(p[e]={name:e,dependencies:[],exports:{},importers:[]})}function n(r){if(!r.module){var o=r.module=t(r.name),a=r.module.exports,u=r.declare.call(e,function(e,r){if(o.locked=!0,"object"==typeof e)for(var t in e)a[t]=e[t];else a[e]=r;for(var n=0,u=o.importers.length;u>n;n++){var i=o.importers[n];if(!i.locked)for(var l=0;l<i.dependencies.length;++l)i.dependencies[l]===o&&i.setters[l](a)}return o.locked=!1,r},r.name);o.setters=u.setters,o.execute=u.execute;for(var s=0,d=r.normalizedDeps.length;d>s;s++){var f,c=r.normalizedDeps[s],v=l[c],m=p[c];m?f=m.exports:v&&!v.declarative?f=v.esModule:v?(n(v),m=v.module,f=m.exports):f=i(c),m&&m.importers?(m.importers.push(o),o.dependencies.push(m)):o.dependencies.push(null),o.setters[s]&&o.setters[s](f)}}}function o(r){var t={};if(("object"==typeof r||"function"==typeof r)&&r!==e)if(d)for(var n in r)"default"!==n&&a(t,r,n);else{var o=r&&r.hasOwnProperty;for(var n in r)"default"===n||o&&!r.hasOwnProperty(n)||(t[n]=r[n])}return t["default"]=r,c(t,"__useDefault",{value:!0}),t}function a(e,r,t){try{var n;(n=Object.getOwnPropertyDescriptor(r,t))&&c(e,t,n)}catch(o){return e[t]=r[t],!1}}function u(r,t){var n=l[r];if(n&&!n.evaluated&&n.declarative){t.push(r);for(var o=0,a=n.normalizedDeps.length;a>o;o++){var d=n.normalizedDeps[o];-1==s.call(t,d)&&(l[d]?u(d,t):i(d))}n.evaluated||(n.evaluated=!0,n.module.execute.call(e))}}function i(e){if(m[e])return m[e];if("@node/"==e.substr(0,6))return m[e]=o(v(e.substr(6)));var r=l[e];if(!r)throw"Module "+e+" not present.";return n(l[e]),u(e,[]),l[e]=void 0,r.declarative&&c(r.module.exports,"__esModule",{value:!0}),m[e]=r.declarative?r.module.exports:r.esModule}var l={},s=Array.prototype.indexOf||function(e){for(var r=0,t=this.length;t>r;r++)if(this[r]===e)return r;return-1},d=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(f){d=!1}var c;!function(){try{Object.defineProperty({},"a",{})&&(c=Object.defineProperty)}catch(e){c=function(e,r,t){try{e[r]=t.value||t.get.call(e)}catch(n){}}}}();var p={},v="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&require.resolve&&"undefined"!=typeof process&&require,m={"@empty":{}};return function(e,t,n,a){return function(u){u(function(u){for(var l=0;l<t.length;l++)(function(e,r){r&&r.__esModule?m[e]=r:m[e]=o(r)})(t[l],arguments[l]);a({register:r});var s=i(e[0]);if(e.length>1)for(var l=1;l<e.length;l++)i(e[l]);return n?s["default"]:s})}}}("undefined"!=typeof self?self:global)

(["1"], [], false, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.register('2', [], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            /**
             * 
             */
            class ContextQuery {
                constructor(query) {
                    // 'Private'
                    this._onchange = null;
                    this._listeners = {};
                    this._queries = this._breakQueriesDown(query);
                    this._intervalID = {};
                    // 'Public'
                    this.context = query;
                    this.matches = this._determineMatch();
                    // attach event listeners
                    this._registerListeners();
                }

                _registerListeners() {
                    if (this.context.includes('light-intensity')) {
                        window.addEventListener('devicelight', e => {
                            let normalised = e.value / 10; // normalise range from 0 to 100, max value on nexus 4 is 1000
                            this._performContextCheck('light-intensity', Math.round(normalised));
                        });
                    }
                    if (this.context.includes('touch')) {
                        this._performContextCheck('touch', 'ontouchstart' in window || navigator.maxTouchPoints ? true : false);
                    }
                    if (this.context.includes('time')) {
                        this._performContextCheck('time', new Date().getHours() * 60 + new Date().getMinutes());
                        this._intervalID = setInterval(() => {
                            this._performContextCheck('time', new Date().getHours() * 60 + new Date().getMinutes());
                        }, 1000);
                    }

                    let acceleration = 0;
                    if (this.context.includes('motion-speed')) {
                        window.addEventListener('devicemotion', function (e) {
                            let accel = Math.round(Math.sqrt(e.acceleration.y * e.acceleration.y + e.acceleration.x * e.acceleration.x));
                            if (accel > acceleration || accel == 0) {
                                acceleration = accel;
                                this._performContextCheck('motion-speed', accel);
                            }
                        });
                    }

                    if (this.context.includes('charging-battery') || this.context.includes('battery')) {
                        navigator.getBattery().then(battery => {
                            if (this.context.includes('charging-battery')) {
                                // Perform check on resolved promise then add change listener
                                this._performContextCheck('charging-battery', battery.charging);
                                battery.addEventListener('chargingchange', () => {
                                    this._performContextCheck('charging-battery', battery.charging);
                                });
                            }
                            if (this.context.includes('battery')) {
                                this._performContextCheck('battery', battery.level * 100);
                                battery.addEventListener('levelchange', () => {
                                    this._performContextCheck('battery', battery.level * 100);
                                });
                            }
                        });
                    }
                }

                /**   
                 * @param {string} fname the name of the feature
                 * @param {number} val the new numeric value
                 */
                _performContextCheck(fname, val) {
                    // update the values passed by the listeners of this._registerListeners() in the window.contextFeatures object
                    for (let i of window.contextFeatures) {
                        if (i.name == fname) {
                            i.value = val;
                        }
                    }
                    this._determineMatch();
                }

                /**   
                 * @param {string} type 
                 * @param {function} callback 
                 */

                addEventListener(type, callback) {
                    if (!(type in this._listeners)) {
                        this._listeners[type] = [];
                    }
                    this._listeners[type].push(callback);
                }

                /** 
                 * @param {function} callback 
                 */

                addListener(callback) {
                    this.addEventListener("change", callback);
                }

                /**   
                 * @param {string} type 
                 * @param {function} callback 
                 */

                removeEventListener(type, callback) {
                    if (!(type in this._listeners)) {
                        return;
                    }
                    let stack = this._listeners[type];

                    for (let i in stack) {
                        console.log(stack[i]);
                        if (stack[i].toString() === callback.toString()) {
                            stack.splice(i, 1);
                            return;
                        }
                    }
                }

                /** 
                 * @param {function} callback 
                 */

                removeListener(callback) {
                    this.removeEventListener("change", callback);
                }

                /** 
                 * @param {CustomEvent} event 
                 */

                dispatchEvent(event) {
                    if (!(event.type in this._listeners)) {
                        return true;
                    }
                    let stack = this._listeners[event.type];

                    //event.target = this;
                    for (let elm of stack) {
                        elm.call(this, event);
                    }
                    return !event.defaultPrevented;
                }

                /** 
                 * @param {function} callback 
                 */

                set onchange(callback) {
                    if (typeof callback == "function") {
                        this.removeEventListener("change", this._onchange);
                        this._onchange = callback;
                        this.addEventListener("change", callback);
                    }
                }

                get onchange() {
                    return this._onchange;
                }

                /**   
                 * @param {string} context 
                 */
                _breakQueriesDown(context) {
                    /**
                     * @param {array} arr the resulting array after having splitted the query using <= or >=
                     * @param {string} symbol the character to look up for in the passed array, either < or >
                     */
                    function mixedSigns(arr, symbol) {
                        let o = { left: false, right: false };
                        if (arr.length == 2) {
                            let left = false,
                                tmpArr,
                                tmpStr;
                            for (let idx in arr) {
                                // check if symbol is present
                                if (arr[idx].includes(symbol)) {
                                    tmpStr = arr[idx];
                                    arr.splice(idx, 1);
                                    if (idx == 0) {
                                        left = true;
                                    }
                                }
                            }
                            // if tmpStr has been assigned value
                            if (tmpStr != undefined) {
                                tmpArr = tmpStr.split(symbol);
                                if (left) {
                                    arr.unshift(tmpArr[1]);
                                    arr.unshift(tmpArr[0]);
                                    if (symbol === '<') {
                                        o.left = true;
                                    } else {
                                        o.right = true;
                                    }
                                } else {
                                    arr.push(tmpArr[0]);
                                    arr.push(tmpArr[1]);
                                    if (symbol === '<') {
                                        o.right = true;
                                    } else {
                                        o.left = true;
                                    }
                                }
                            }
                        }
                        return o;
                    }

                    /**
                     * @param {string} brackets the type of brackets as pair [],{},()
                     * @param {string} str the string where the brackets are to be found 
                     */

                    function findClosingBracket(start, str) {
                        let c = str.indexOf('(', start);
                        let i = 1;
                        while (i > 0) {
                            let b = str[++c];
                            if (b == '(') {
                                i++;
                            } else if (b == ')') {
                                i--;
                            }
                        }
                        return c;
                    }

                    let newCtxArr = { queries: [] };

                    /**
                     * @param {string} obj an object representing all relations between the queries of which the context is composed 
                     * such an object has the following structure:
                     * {
                     *  operator: 'and' | 'or' // optional: the operator combining two or more queries
                     *  negate: true // optional: whether the expression has been prefixed with 'not'
                     *  queries: [ // array of objects
                     *      { // an object representing a query
                     *          context: '120 < time < 600', // the query
                     *          feature: 'time', // the name of the feature
                     *          lt_gt: { // optional when using < or >
                     *              left: true | false,
                     *              right: true | false
                     *          },
                     *          max: 600, // optional: the max value specified in the query
                     *          min: 120, // optional: the min value specified in the query
                     *          abs: true | 'string' // optional: whether the query has an absolute value 
                     *      },
                     *      { // an object with the same structure as its parent
                     *          operator: 'and',
                     *          queries: [
                     *              ...
                     *          ]
                     *      }
                     *  ]
                     * }
                     * @param {string} context the composed context 
                     */

                    function findQueriesRecursively(obj, context) {
                        let q = '',
                            idx = context.indexOf('(');

                        // check if the expression has prefix 'not', if so set idx to 0 
                        if (context.substring(idx - 3, idx) === 'not') {
                            idx = idx - 3;
                        }
                        // if idx != 0 we're dealing with an operator
                        if (idx != 0) {
                            q = context.substring(0, idx);
                        } else {
                            q = context.substring(idx, findClosingBracket(idx, context) + 1);
                        }
                        // replace the substring 
                        context = context.replace(q, '');
                        q = q.trim();

                        // if substring is empty iterate through the queries array recursively
                        if (q !== '') {
                            if (q == 'or' || q == 'and') {
                                obj.operator = q;
                            } else {
                                if (!q.includes('and') && !q.includes('or')) {
                                    let ra,
                                        prcnt = '%',
                                        objct = {},
                                        objName,
                                        incdec,
                                        lt = '<',
                                        gt = '>',
                                        lteq = '<=',
                                        gteq = '>=';
                                    if (q.substring(q.indexOf('(') - 3, q.indexOf('(')) === 'not') {
                                        objct.negate = true;
                                    }
                                    objct.context = q.substring(q.indexOf('(') + 1, q.indexOf(')'));
                                    if (objct.context.includes(lt) || objct.context.includes(gt)) {
                                        if (objct.context.includes(lt) && objct.context.includes(gt)) {
                                            console.error('you have mixed the greater than and less than symbol in an expression!');
                                            return;
                                        }
                                        if (objct.context.includes(lt)) {
                                            if (objct.context.includes(lteq)) {
                                                ra = objct.context.split(lteq);
                                                incdec = mixedSigns(ra, lt);
                                            } else {
                                                ra = objct.context.split(lt);
                                                incdec = { left: true, right: true };
                                            }
                                            if (ra.length == 2) {
                                                if (ra[0].includes(prcnt) || !isNaN(ra[0])) {
                                                    objct.min = parseFloat(ra[0]);
                                                    objct.feature = ra[1].trim();
                                                } else {
                                                    objct.max = parseFloat(ra[1]);
                                                    objct.feature = ra[0].trim();
                                                }
                                            } else {
                                                objct.feature = ra[1].trim();
                                                objct.min = parseFloat(ra[0]);
                                                objct.max = parseFloat(ra[2]);
                                            }

                                            if (incdec.left || incdec.right) {
                                                objct.lt_gt = incdec;
                                            }
                                            q = {};
                                            q = objct;
                                        }
                                        if (objct.context.includes(gt)) {
                                            if (objct.context.includes(gteq)) {
                                                ra = objct.context.split(gteq);
                                                incdec = mixedSigns(ra, gt);
                                            } else {
                                                ra = objct.context.split(gt);
                                                incdec = { left: true, right: true };
                                            }
                                            if (ra.length == 2) {
                                                if (ra[0].includes(prcnt) || !isNaN(ra[0])) {
                                                    objct.max = parseFloat(ra[0]);
                                                    objct.feature = ra[1].trim();
                                                } else {
                                                    objct.min = parseFloat(ra[1]);
                                                    objct.feature = ra[0].trim();
                                                }
                                            } else {
                                                objct.feature = ra[1].trim();
                                                objct.max = parseFloat(ra[0]);
                                                objct.min = parseFloat(ra[2]);
                                            }
                                            if (incdec.left || incdec.right) {
                                                objct.lt_gt = incdec;
                                            }
                                            q = {};
                                            q = objct;
                                        }
                                    } else if (objct.context.includes(':')) {
                                        let a, objVal;
                                        a = objct.context.split(/\s*:\s*/);
                                        objName = a[0].trim();
                                        objct.feature = objName;
                                        objVal = parseFloat(a[1]);

                                        if (objName.includes('min-') || objName.includes('max-')) {
                                            objName = objName.replace('min-', '');
                                            objName = objName.replace('max-', '');
                                            objct.feature = objName;
                                            if (a[0].includes('min-')) {
                                                objct.min = objVal;
                                            }
                                            if (a[0].includes('max-')) {
                                                objct.max = objVal;
                                            }
                                            q = {};
                                            q = objct;
                                        } else {
                                            objct.abs = objVal;
                                            q = {};
                                            q = objct;
                                        }
                                    } else {
                                        if (objct.context) {
                                            objct.feature = objct.context;
                                            objct.abs = true;
                                            q = {};
                                            q = objct;
                                        }
                                    }
                                }
                                obj.queries.push(q);
                            }
                            // carry on recursively with the rest of the string
                            findQueriesRecursively(obj, context);
                        } else {
                            for (let i in obj.queries) {
                                if (typeof obj.queries[i] === 'string') {
                                    context = obj.queries[i];
                                    obj.queries[i] = { queries: [] };
                                    if (context.substring(context.indexOf('(') - 3, context.indexOf('(')) === 'not') {
                                        context = context.replace('not', '');
                                        obj.queries[i].negate = true;
                                    }
                                    context = context.substring(context.indexOf('(') + 1, findClosingBracket(context.indexOf('('), context));

                                    findQueriesRecursively(obj.queries[i], context);
                                }
                            }
                        }
                    }

                    findQueriesRecursively(newCtxArr, context.trim());

                    return newCtxArr;
                }

                _determineMatch() {
                    /** 
                    * @param {object} obj the object representing the combined queries in a tree-like structure  
                    */
                    function evaluateQueriesRecursively(obj) {
                        let tmp, operator;

                        // check if the combined query has been prefixed with 'not', if so invert the operators
                        if (obj.hasOwnProperty('negate')) {
                            if (obj.operator === 'and') {
                                operator = 'or';
                            } else if (obj.operator === 'and') {
                                operator = 'and';
                            }
                        } else {
                            operator = obj.operator;
                        }

                        for (let q of obj.queries) {
                            if (!q.hasOwnProperty('queries')) {
                                let b1 = true,
                                    min = Number.NEGATIVE_INFINITY,
                                    max = Number.POSITIVE_INFINITY;
                                for (let feature of window.contextFeatures) {
                                    if (feature.name === q.feature) {
                                        // Compare to values stored in Features object
                                        //if(feature.supported) {
                                        // has an unique value either numeric or boolean
                                        if (q.hasOwnProperty('abs')) {
                                            if (Number.isInteger(q.abs)) {
                                                if (feature.value != q.abs) {
                                                    b1 = false;
                                                }
                                            } else {
                                                if (!feature.value) {
                                                    b1 = false;
                                                }
                                            }
                                        } else {
                                            // Value is in range
                                            if (q.hasOwnProperty('min')) {
                                                min = q.min;
                                            }
                                            if (q.hasOwnProperty('max')) {
                                                max = q.max;
                                            }
                                            if (q.hasOwnProperty('lt_gt')) {
                                                if (q.lt_gt.left) {
                                                    ++min;
                                                }
                                                if (q.lt_gt.right) {
                                                    --max;
                                                }
                                            }
                                            if (min != -Infinity || max != Infinity) {
                                                if (feature.value < min || max < feature.value) {
                                                    b1 = false;
                                                }
                                            }
                                        }
                                        if (q.hasOwnProperty('negate')) {
                                            b1 = !b1;
                                        }
                                        //} else {
                                        //    b1 = false;
                                        //}
                                    }
                                }
                                if (obj.hasOwnProperty('negate')) {
                                    b1 = !b1;
                                }
                                if (obj.queries.indexOf(q) === 0) {
                                    tmp = b1;
                                } else {
                                    if (operator === 'and') {
                                        tmp = tmp && b1;
                                    }
                                    if (operator === 'or') {
                                        tmp = tmp || b1;
                                    }
                                }
                            } else {
                                if (obj.queries.indexOf(q) !== 0) {
                                    if (operator === 'and') {
                                        tmp = tmp && evaluateQueriesRecursively(q);
                                    }
                                    if (operator === 'or') {
                                        tmp = tmp || evaluateQueriesRecursively(q);
                                    }
                                } else {
                                    tmp = evaluateQueriesRecursively(q);
                                }
                            }
                        }
                        return tmp;
                    }

                    let b = evaluateQueriesRecursively(this._queries);

                    if (b != this.matches) {
                        if (this.matches == undefined) {
                            return b;
                        } else {
                            this.matches = b;
                            this.dispatchEvent(new CustomEvent("change", { detail: { matches: b, target: this } }));
                        }
                    }
                }
            }

            _export('default', ContextQuery);

            // matchContext function to instantiate ContextQueryList Object with -- let varname = window.matchContext("(touch)") -- 
            window.matchContext = function (expression) {
                let o = new ContextQuery(expression);
                console.log(o);
                return o;
            };

            // new features structure
            window.contextFeatures = [{ name: 'light-intensity', value: null, supported: function () {
                    return 'ondevicelight' in window ? true : false;
                }() }, { name: 'motion-speed', value: null, supported: function () {
                    return 'ondevicemotion' in window ? true : false;
                }() }, { name: 'touch', value: null, supported: function () {
                    return 'ontouchstart' in window || navigator.maxTouchPoints ? true : false;
                }() }, { name: 'time', value: null, supported: true }, { name: 'battery', value: null, supported: function () {
                    return navigator.getBattery ? true : false;
                }() }, { name: 'charging-battery', value: null, callback: function () {
                    return navigator.getBattery ? true : false;
                }() }];
        }
    };
});
$__System.register('3', [], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            /**
             * 
             */
            class ContextStyle extends HTMLElement {

                constructor() {
                    super();
                    this._arrayOfQueries = [];
                    this._host = document.querySelector("html");
                    this._head = document.querySelector('head');
                    this._contextQueryObjectList = [];
                }

                connectedCallback() {
                    this.style.display = 'none';
                    if (this.parentNode.host != undefined) {
                        if (!this.parentNode.host.shadowRoot.querySelector('slot')) {
                            this._host = this.parentNode.host;
                            this._head = this._host.shadowRoot;
                        }
                    }
                    this.getHrefAttr();
                }

                disconnectedCallback() {
                    for (let i in this._contextQueryObjectList) {
                        if (this._contextQueryObjectList[i]._intervalID != undefined) {
                            clearInterval(this._contextQueryObjectList[i]._intervalID);
                        }
                        this._contextQueryObjectList[i] = null;
                        delete this._contextQueryObjectList[i];
                    }
                    for (let j of this._arrayOfQueries) {
                        this._host.classList.remove(j.class);
                    }
                    this._contextQueryObjectList.length = 0;
                    //console.log(this._contextQueryObjectList);
                }

                /**
                 * @param {string} attr - the query from the "context" attribute   
                 */
                getContent(attr) {
                    let inner = this.innerHTML;
                    if (inner.trim() != '') {
                        inner = inner.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
                        this.instantiateContextQueryObjects(inner.trim(), attr);
                    } else {
                        console.error('Context-Styles have not been declared, please use the href attribute or write them directly in the context-style tag.');
                    }
                }

                getHrefAttr() {
                    let attr = false;
                    if (this.hasAttribute('context') && this.getAttribute('context') != "") {
                        attr = this.getAttribute('context');
                    }
                    if (this.hasAttribute('href') && this.getAttribute('href') != "") {
                        this.getURL(this.getAttribute('href')).then(response => {
                            this.instantiateContextQueryObjects(response, attr);
                            //this.content(attr);
                        }, error => {
                            console.error("Failed!", error);
                        });
                    } else {
                        //console.log('href empty or non existent');
                        this.getContent(attr);
                    }
                }

                /**   
                 * @param {string} url - the link to an external context query sheet
                 */

                getURL(url) {
                    return new Promise(function (resolve, reject) {
                        var req = new XMLHttpRequest();
                        req.open('GET', url);
                        req.onload = function () {
                            if (req.status == 200) {
                                resolve(req.response);
                            } else {
                                reject(Error(req.statusText));
                            }
                        };
                        req.onerror = function () {
                            reject(Error("Network Error"));
                        };
                        req.send();
                    });
                }

                /**
                 * @param {string} str the styles found inside the <context-style> custom element
                 * @param {string} attr the query of the "context" attribute 
                 */

                instantiateContextQueryObjects(str, attr) {
                    this.factoriseContextQueries(str, attr);
                    for (let contextQuery of this._arrayOfQueries) {
                        // Generate unique class;
                        // unary operator in +new Date equivalent to Number(new Date)
                        const cssClass = 'css-ctx-queries-' + (+new Date()).toString(36) + this._arrayOfQueries.indexOf(contextQuery);
                        contextQuery.class = cssClass;
                        // Instantiate Object with new constructor
                        let cqo = window.matchContext(contextQuery.expression),
                            css = "";
                        // Define a callback on change
                        cqo.onchange = e => {
                            if (e != undefined) {
                                console.log(e);
                            }
                            if (cqo.matches) {
                                if (!this._host.classList.contains(cssClass)) {
                                    this._host.classList.add(cssClass);
                                }
                            } else {
                                if (this._host.classList.contains(cssClass)) {
                                    this._host.classList.remove(cssClass);
                                }
                            }
                        };
                        // trigger the callback for the first time
                        cqo.onchange();

                        this._contextQueryObjectList.push(cqo);

                        for (let style of contextQuery.styles) {
                            let key = style.selector;
                            if (this._host.shadowRoot != undefined) {
                                if (!this._host.shadowRoot.querySelector('slot')) {
                                    if (key == ':host') {
                                        css += ':host(.' + cssClass + ') ' + '{' + style.properties + '}';
                                    } else {
                                        css += ':host(.' + cssClass + ') ' + key.replace('&gt;', '>') + '{' + style.properties + '}';
                                    }
                                } else {
                                    css += '.' + cssClass + ' ' + this._host.localName + ' ' + key.replace('&gt;', '>') + '{' + style.properties + '}';
                                }
                            } else {
                                if (key === 'html') {
                                    css += key + '.' + cssClass + '{' + style.properties + '}';
                                } else {
                                    css += '.' + cssClass + ' ' + key.replace('&gt;', '>') + '{' + style.properties + '}';
                                }
                            }
                        }

                        if (this._head.querySelector('#cssCtxQueriesStyleTag')) {
                            this._head.querySelector('#cssCtxQueriesStyleTag').appendChild(document.createTextNode(css));
                        } else {
                            let style = document.createElement('style');
                            style.id = 'cssCtxQueriesStyleTag';
                            style.appendChild(document.createTextNode(css));
                            this._head.appendChild(style);
                        }
                    }
                }

                /**
                 * @param {string} brackets the type of brackets as pair [],{},()
                 * @param {string} str the string where the brackets are to be found 
                 */

                findClosingBracket(brackets, str) {
                    let c = str.indexOf(brackets[0], str.indexOf('@context'));
                    let i = 1;
                    while (i > 0) {
                        let b = str[++c];
                        if (b == brackets[0]) {
                            i++;
                        } else if (b == brackets[1]) {
                            i--;
                        }
                    }
                    return c;
                }

                /**
                 * @param {string} str - the content of the <context-style> custom element
                 * @param {string} attr - the content of the context attribute, false if the context attribute is empty
                 */

                factoriseContextQueries(str, attr) {
                    if (str.includes('@context')) {
                        let sbstrng = str.substring(str.indexOf("@context"), this.findClosingBracket('{}', str) + 1);
                        let str2 = str.replace(sbstrng, '');
                        str2 = str2.trim();
                        this._arrayOfQueries.push(sbstrng);
                        this.factoriseContextQueries(str2, attr);
                    } else {
                        // push the query from the context attribute into _arrayOfQueries
                        if (attr != false) {
                            this._arrayOfQueries.push('@context ' + attr + ' {' + str + '}');
                        }
                        let newArrayOfQueries = [];
                        for (let elm of this._arrayOfQueries) {
                            let expression = elm.substring(8, elm.indexOf('{'));
                            let styles = elm.substring(elm.indexOf('{') + 1, elm.lastIndexOf('}'));
                            let arrayOfSelectors = [],
                                singleStyles = styles.split(/\s*}\s*/);
                            for (let z of singleStyles) {
                                let classes, attrs, classArr;
                                classes = z.substring(0, z.indexOf("{"));
                                attrs = z.substring(z.indexOf("{") + 1);
                                classArr = classes.split(/\s*,\s*/);
                                for (let sc of classArr) {
                                    let obj = { selector: sc.trim(), properties: attrs.trim() };
                                    if (obj.selector != "" || obj.properties !== "") {
                                        arrayOfSelectors.push(obj);
                                    }
                                }
                            }

                            newArrayOfQueries.push({ expression: expression.trim(), styles: arrayOfSelectors });
                        }

                        // factorise all objects in _arrayOfQueries only if there's a global query and more than one query in total 
                        if (attr != false) {
                            let globalQuery = newArrayOfQueries[newArrayOfQueries.length - 1].expression;
                            if (globalQuery.includes('or') || globalQuery.includes(',')) {
                                globalQuery = '(' + globalQuery + ')';
                            }
                            for (let i = 0; i < newArrayOfQueries.length - 1; i++) {
                                if (newArrayOfQueries[i].expression.includes('or') || newArrayOfQueries[i].expression.includes(',')) {
                                    newArrayOfQueries[i].expression = '(' + newArrayOfQueries[i].expression + ')';
                                }
                                newArrayOfQueries[i].expression += ' and ' + globalQuery;
                            }
                        }
                        this._arrayOfQueries = [];
                        // reorganise arrayOfQueries
                        for (let i of newArrayOfQueries) {
                            if (i.styles.length > 0) {
                                this._arrayOfQueries.push(i);
                            }
                        }
                    }
                }

            }

            _export('default', ContextStyle);

            document.addEventListener('DOMContentLoaded', function () {
                window.customElements.define('context-style', ContextStyle);
            });
        }
    };
});
$__System.register('1', ['2', '3'], function (_export, _context) {
  "use strict";

  var ContextQuery, ContextStyle;
  return {
    setters: [function (_) {
      ContextQuery = _.default;
    }, function (_2) {
      ContextStyle = _2.default;
    }],
    execute: function () {
      _export('ContextQuery', ContextQuery);

      _export('ContextStyle', ContextStyle);
    }
  };
});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define([], factory);
  else if (typeof module == 'object' && module.exports && typeof require == 'function')
    module.exports = factory();
  else
    cq = factory();
});