// new features structure
let features = [
    { name: 'devicelight', value: null, callback: null },
    { name: 'devicemotion', value: null, callback: null },
    { name: 'deviceproximity', value: null, callback: null },
    { name: 'touch', value: null, callback: function() { return ('ontouchstart' in window || navigator.maxTouchPoints)?true:false } },
    { name: 'time', value: null, callback: function() { return true }},
    { name: 'battery', value: null, callback: function() { return true }}
];
(function () {
    for(feature of features) {
        if(feature.callback == null) {
            if('on' + feature.name in window) {
                feature.supported = true;
            } else {
                feature.supported = false;
            }
        } else {
            feature.supported = feature.callback();
        }    
    }
    console.log(features);
})();

class ContextQueryList {
    constructor(query, host) {
        this.context = query;
        this.onchange = null;
        this._private = { listeners: {}, host: host, queries: this.breakQueriesDown() };
        this.matches = this.determineMatch();
    }

    addEventListener(type, callback) {
        if (!(type in this._private.listeners)) {
            this._private.listeners[type] = [];
        }
        this._private.listeners[type].push(callback);
    };

    addListener(callback) {
        this.addEventListener("change", callback);
    }

    removeEventListener(type, callback) {
        if (!(type in this._private.listeners)) {
            return;
        }
        let stack = this._private.listeners[type];

        for (let i in stack) {
            console.log(stack[i]);  
            if (stack[i].toString() === callback.toString()){
                stack.splice(i, 1);
                return;
            }
        }
    };

    removeListener(callback) {
        this.removeEventListener("change", callback)
    }

    dispatchEvent(event) {
        if (!(event.type in this._private.listeners)) {
            return true;
        }
        let stack = this._private.listeners[event.type];

        //event.target = this;
        for (let elm of stack) {
            elm.call(this, event);
        }
        return !event.defaultPrevented;
    };

    set onchange(callback) {    
        if(typeof callback == "function") {
            this.removeEventListener("change", this.onchange);
            onchange = callback;
            this.addEventListener("change", callback);
        } 
    } 

    get onchange() {
        return onchange;
    }

    breakQueriesDown() {
        let arrayOfContexts = [], or = /\s*,\s*|\s*or\s*/i, orArr = this.context.split(or), lt = '<', gt = '>', lteq = '<=', gteq = '>=';
        for (let y of orArr) {
            let contextRuleObj = { contexts: [] },  arrOfObj = [];
            let andArr = y.split(/\s*and\s*/i);
            for (let j of andArr) {
                let sr = j.substring(j.indexOf("(")+1,j.indexOf(")")), ra, prcnt = '%', obj = {}, objName, incdec = {left:false,right:false};
                if( j.includes(lt) || j.includes(gt) ) {               
                    if (sr.includes(lt) && sr.includes(gt)) {
                        console.error('you have mixed the greater than and less than symbol in an expression!');
                        return;
                    }
                
                    if (sr.includes(lt)) {
                        if (sr.includes(lteq)) {
                            ra = sr.split(lteq);
                            mixedSigns(ra,lt,incdec);
                        } else {
                            ra = sr.split(lt);
                            incdec = {left:true,right:true};   	
                        }  
                        if(ra.length == 2) {
                            if(ra[0].includes(prcnt) || !isNaN(ra[0])) {
                                obj.min = parseFloat(ra[0]); 
                                obj.feature = ra[1].trim();
                            } else {
                                obj.max = parseFloat(ra[1]); 
                                obj.feature = ra[0].trim();                                
                            }
                        } else {
                            obj.feature = ra[1].trim();
                            obj.min = parseFloat(ra[0]);
                            obj.max = parseFloat(ra[2]);
                        }
                        
                        if( incdec.left || incdec.right ) {
                            obj.lt_gt = incdec;
                        }
                        arrOfObj.push(obj);
                    }
                    if (sr.includes(gt)) {
                        if (sr.includes(gteq)) {
                            ra = sr.split(gteq);
                            mixedSigns(ra,gt,incdec);
                        } else {
                            ra = sr.split(gt);
                            incdec = {left:true,right:true};
                        } 
                        if(ra.length == 2) {
                            if(ra[0].includes(prcnt) || !isNaN(ra[0])) {
                                obj.max = parseFloat(ra[0]);
                                obj.feature = ra[1].trim();
                            } else {
                                obj.min = parseFloat(ra[1]);
                                obj.feature = ra[0].trim();
                            }
                            
                        } else {
                            obj.feature = ra[1].trim();
                            obj.max = parseFloat(ra[0]);
                            obj.min = parseFloat(ra[2]);
                        }
                        if( incdec.left || incdec.right ) {
                            obj.lt_gt = incdec;
                        }
                        arrOfObj.push(obj);
                        
                    }
                } else if( j.includes(':')) {                
                    let inner, a, objVal;
                    inner = j.substring(j.indexOf("(")+1,j.indexOf(")"));           
                    a = inner.split(/\s*:\s*/);
                    objName = a[0].trim();
                    obj.feature = objName;
                    objVal = parseFloat(a[1]);
                    
                    if( objName.includes('min-') || objName.includes('max-')) {
                        objName = objName.replace('min-','');
                        objName = objName.replace('max-','');
                        obj.feature = objName;
                        if(arrOfObj.length == 0) {
                            if(a[0].includes('min-')) {
                                obj.min = objVal;
                            }
                            if(a[0].includes('max-')) {
                                obj.max = objVal;
                            }                  
                            arrOfObj.push(obj);
                        } else {
                            for(let i of arrOfObj) {
                                if(i.feature != obj.feature) {
                        
                                    if(a[0].includes('min-')) {
                                        obj.min = objVal;
                                    }
                                    if(a[0].includes('max-')) {
                                        obj.max = objVal;
                                    }
                                    arrOfObj.push(obj);
                                } else {
                                    if(a[0].includes('min-')) {
                                        i.min = objVal;
                                    }
                                    if(a[0].includes('max-')) {
                                        i.max = objVal;
                                    } 
                                }
                            }
                        } 
                    } else {
                        obj.abs = objVal;
                        arrOfObj.push(obj);
                    }
                } else {
                    let inner = j.substring(j.indexOf("(")+1,j.indexOf(")"));
                    if(inner) {
                        obj.feature = inner;
                        obj.abs = true;
                        arrOfObj.push(obj);
                    }  
                }
            }         
            arrayOfContexts.push(arrOfObj);
        }
        return arrayOfContexts;
    }

    determineMatch() {
        let b = false;
        for (let j of this._private.queries) {
            let b2 = true;
            for(let k of j){                 
                let min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY; 
                for(let feature of features ){
                    if(feature.name === k.feature) {
                        // Compare to values stored in Features object
                        //if(feature.supported) {
                            // has an unique value either numeric or boolean
                            if(k.hasOwnProperty('abs')) {
                                if(Number.isInteger(k.abs)) {
                                    if(feature.value != k.abs) {
                                        b2 = false;
                                    }
                                } else {
                                    if(!feature.value) {
                                        b2 = false;
                                    }
                                }
                            } else {
                                // Value is in range
                                if(k.hasOwnProperty('min')) {
                                    min = k.min;
                                }         
                                if(k.hasOwnProperty('max')) {
                                    max = k.max;
                                }
                                if(k.hasOwnProperty('lt_gt')) {
                                    if(k.lt_gt.left) {
                                        ++min;
                                    } 
                                    if(k.lt_gt.right) {
                                        --max;
                                    }
                                }
                                if(min != -Infinity || max != Infinity) {                                  
                                    if ( feature.value < min || max < feature.value) {
                                        b2 = false;
                                    }         
                                }
                            }
                        //} else {
                        //    b2 = false;
                        //}
                    }  
                }              
            }
            if(b2) {
                b = true;
            }                                                      
        }
        if( b != this.matches ) {            
            if(this.matches == undefined) {
                return b;
            } else {
                this.matches = b;
                this.dispatchEvent(new CustomEvent("change", { detail: { matches: b, target: this }}));
            }
                   
        } 
    }
}

///////********* helper function */

function findClosingBracket(brackets, str){
    let c = str.indexOf(brackets[0], str.indexOf('@context'));
    let i = 1;
    while (i > 0) {
        let b = str[++c];
        if (b == brackets[0]) {
            i++;
        }
        else if (b == brackets[1]) {
            i--;
        }
    }
    return c;
}

class contextStyle extends HTMLElement {
    constructor() {
        super();
        this.arrayOfQueries = [];
    }
    connectedCallback() {
        this.href();
        this.style.display = 'none';     
    }
    content(attrctx) {
        let inner = this.innerHTML;    
        if(inner.trim() != ''){
            inner = inner.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
            this.instantiateContextQueryObjects( inner.trim(), attrctx );
        } else {
            console.error('Context-Styles have not been declared, please use the href attribute or write them directly in the context-style tag.');
        }
                
    }
    href() {
        let attrctx = false;
        if(this.hasAttribute('context') && this.getAttribute('context') != "") {
            attrctx = this.getAttribute('context'); 
        } 
        if(this.hasAttribute('href') && this.getAttribute('href') != "") {
            get(this.getAttribute('href')).then((response) => {
                this.instantiateContextQueryObjects(response, attrctx);
                //this.content(attrctx);
            }, (error) => {
                console.error("Failed!", error);
            });
        } else {
            //console.log('href empty or non existent');
            this.content(attrctx);
        }   
    }
    
    /**
     * @param {string} str the content of the <context-style> custom element
     * @param {string} attrctx the content of the context attribute 
     */

    instantiateContextQueryObjects(str,attr) {
        this.factoriseContextQueries(str,attr);
        let head = document.querySelector('head'), prefix = '.css-ctx-queries-', host; 
        for(let contextQuery of this.arrayOfQueries) {
            if(this.parentNode.host != undefined) {
                if(!this.parentNode.host.shadowRoot.querySelector('slot')) {
                    host = this.parentNode.host;
                    head = this.parentNode.host.shadowRoot;
                }
            }
            // Instantiate Object with new constructor
            let cqo = new ContextQueryList(contextQuery.expression, host), css = "";
            cqo.breakQueriesDown();
            // Push the object into the global array
            if(typeof window.contextQueryObjectsList == "undefined") {
                window.contextQueryObjectsList = [];
            }
            window.contextQueryObjectsList.push(cqo);

            for(let style of contextQuery.styles) {
                let key = style.selector;
                if(this.parentNode.host != undefined) {
                    if(!this.parentNode.host.shadowRoot.querySelector('slot')) {
                        if(key == ':host') {
                            css += ':host(' + prefix + window.contextQueryObjectsList.indexOf(cqo) + ') ' + '{' + style.properties + '}'; 
                        } else {
                            css += ':host(' + prefix + window.contextQueryObjectsList.indexOf(cqo) + ') ' + key.replace('&gt;','>') + '{' + style.properties + '}';                            
                        }
                    } else {
                        css += prefix + window.contextQueryObjectsList.indexOf(cqo) + ' ' + this.parentNode.host.localName + ' ' + key.replace('&gt;','>') + '{' + style.properties + '}'; 
                    }
                } else {
                    if(key === 'html') {
                        css += key + prefix + window.contextQueryObjectsList.indexOf(cqo) + '{' + style.properties + '}';
                    } else {
                        css +=  prefix + window.contextQueryObjectsList.indexOf(cqo) + ' ' + key.replace('&gt;','>') + '{' + style.properties + '}';
                    }
                }  
            }
           
            if(head.querySelector('#cssCtxQueriesStyleTag')) {
                head.querySelector('#cssCtxQueriesStyleTag').appendChild(document.createTextNode(css));
            } else {
                let style = document.createElement('style');
                style.id = 'cssCtxQueriesStyleTag';
                style.appendChild(document.createTextNode(css));
                head.appendChild(style);
            }
        }
        //console.log(window.contextQueryObjectsList);
    }

    /**
     * @param {string} str the content of the <context-style> custom element
     * @param {string} attrctx the content of the context attribute 
     */

    factoriseContextQueries(str, ctxattr) {   

        if(str.includes('@context')){
            let sbstrng = str.substring(str.indexOf("@context"), findClosingBracket('{}',str) + 1);
            let str2 = str.replace(sbstrng,'');
            str2 = str2.trim();
            this.arrayOfQueries.push(sbstrng);
            this.factoriseContextQueries(str2, ctxattr);
        } else {
            this.arrayOfQueries.push('@context'+ ctxattr +' {'+ str + '}');
            let newArrayOfQueries = [];
            for (let elm of (this.arrayOfQueries)) {
                let expression = elm.substring(8, elm.indexOf('{'));
                let styles = elm.substring(elm.indexOf('{') + 1,elm.lastIndexOf('}'));
                let arrayOfSelectors = [], singleStyles = styles.split(/\s*}\s*/);
                for (let z of singleStyles){
                    let classes, attrs, classArr; 
                    classes = z.substring(0,z.indexOf("{"));
                    attrs =  z.substring(z.indexOf("{") + 1);                            
                    classArr = classes.split(/\s*,\s*/);
                    for(let sc of classArr) {
                        let obj = { selector: sc.trim(), properties: attrs.trim() };
                        if(obj.selector != "" || obj.properties !== "") {
                            arrayOfSelectors.push(obj);
                        }
                    }
                }

                newArrayOfQueries.push({expression:expression.trim(),styles:arrayOfSelectors});
            }
            if(newArrayOfQueries.length > 1) {
                let globalQuery = newArrayOfQueries[newArrayOfQueries.length - 1].expression;
                for(let i = 0; i < newArrayOfQueries.length - 1; i++) {
                    newArrayOfQueries[i].expression += ' and ' + globalQuery;
                }
            }
            this.arrayOfQueries = [];
            this.arrayOfQueries = newArrayOfQueries;
            newArrayOfQueries = [];
        }
    }
  
}

customElements.define('context-style', contextStyle);

/**
 * @param {array} arr
 * @param {string} symbol
 * @param {array} indc
 */
function mixedSigns(arr,symbol,indc) {
    if (arr.length == 2) {
        let left = false, tmpArr, tmpStr;
        for (let idx in arr) {            
            // check if symbol is present, &lt; or &gt;
            if(arr[idx].includes(symbol)) {
                tmpStr = arr[idx];
                arr.splice(idx,1);
                if(idx==0) {
                    left = true;
                } 
            }
        }
        // if tmpStr has been assigned value
        if(tmpStr != undefined) {
            tmpArr = tmpStr.split(symbol);
            if (left) {
                arr.unshift(tmpArr[1]);
                arr.unshift(tmpArr[0]);
                if( symbol === '&lt;') {
                    indc.left = true;
                } else {
                    indc.right = true;
                }
                
            } else {
                arr.push(tmpArr[0]);
                arr.push(tmpArr[1]);
                if( symbol === '&lt;') {
                    indc.right = true;
                } else {
                    indc.left = true;
                }
            }
        }          
        //console.log(arr);
    }
}

/* 

let EventTarget = (function() {
    function EventTarget(listeners) {
        this._listeners = {change: []};
    }
    EventTarget.prototype._listeners = null;
    EventTarget.prototype.addEventListener = function(type, callback) {
        if (!(type in this._listeners)) {
            this._listeners[type] = [];
        }
        this._listeners[type].push(callback);
    };

    EventTarget.prototype.removeEventListener = function(type, callback) {
        if (!(type in this._listeners)) {
            return;
        }
        let stack = this._listeners[type];
        console.log(stack);
        for (let i in stack) {
            console.log(stack[i]);  
            if (stack[i].toString() === callback.toString()){
                stack.splice(i, 1);
                return;
            }
        }
    };

    EventTarget.prototype.dispatchEvent = function(event) {
        if (!(event.type in this._listeners)) {
            return true;
        }
        let stack = this._listeners[event.type];
        console.log(stack);
        event.target = this;
        for (let elm of stack) {
            elm.call(this, event);
        }
        return !event.defaultPrevented;
    };
    return EventTarget;
}());

// Same Eventtarget with weak map, listeners Object is "private"
let EventTarget = (function() {
    let listeners = new WeakMap();
    function EventTarget() {
        let private = {};
        listeners.set(this, private);
    }
    EventTarget.prototype.listeners = null;
    EventTarget.prototype.addEventListener = function(type, callback) {
        if (!(type in listeners.get(this))) {
            listeners.get(this)[type] = [];
        }
        listeners.get(this)[type].push(callback);
    };

    EventTarget.prototype.removeEventListener = function(type, callback) {
        if (!(type in listeners.get(this))) {
            return;
        }
        let stack = listeners.get(this)[type];
        for (let i in stack) {
            console.log(stack[i]);  
            if (stack[i].toString() === callback.toString()){
                stack.splice(i, 1);
                return;
            }
        }
    };

    EventTarget.prototype.dispatchEvent = function(event) {
        if (!(event.type in listeners.get(this))) {
            return true;
        }
        let stack = listeners.get(this)[event.type];
        event.target = this;
        for (let elm of stack) {
            elm.call(this, event);
        }
        return !event.defaultPrevented;
    };

    EventTarget.prototype.getListeners = function() {
        return listeners.get(this);
    };
    return EventTarget;
}());


let ContextQueryList = (function(){
    function ContextQueryList(expression){
        EventTarget.call(this); // call super constructor.
        this.context = expression;
        this.onchange = null;
        this.matches = false;
    } 
    // subclass extends superclass
    ContextQueryList.prototype = Object.create(EventTarget.prototype);
    ContextQueryList.prototype.constructor = ContextQueryList;

    Object.defineProperty(ContextQueryList.prototype, 'matches', {
        get: () => {
            return this.matches;
        }
    });

    Object.defineProperty(ContextQueryList.prototype, 'onchange', {
        get: () => { return this.onchange },
        set: (callback) => {
            if(typeof callback == "function") {
                this.onchange = callback;
                ContextQueryList.prototype.addEventListener("change", callback);
            } 
        }
    });
    return ContextQueryList;
}());
*/



/**   
 * @param {string} url
 */
function get(url) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function() {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(Error(req.statusText));
            }
        };
        req.onerror = function() {
            reject(Error("Network Error"));
        };
        req.send();
    });
}

// update features object based on event listener
/**   
 * @param {string} n
 * @param {number} v
 */
function updateFeatVal(n,v) {
    for(let i of features) {
        if(i.name == n) {
            i.value = v;
        }
    }
}
// Add and remove the classes on the root element
/**   
 * @param {string} fname
 * @param {number} val
 */
function performContextCheck(fname,val) {
    updateFeatVal(fname,val);

    for (let i of window.contextQueryObjectsList) {
        if(i.context.includes(fname)){
            i.determineMatch();
            if(i._private.host != false) {
                let root = document.querySelector("html"), clss = 'css-ctx-queries-' + window.contextQueryObjectsList.indexOf(i); 
                if(i._private.host != undefined) {
                    root = i._private.host;
                }
                if( i.matches ) {
                    if(!root.classList.contains(clss)){                   
                        root.classList.add(clss);
                    }       
                } else  {
                    if(root.classList.contains(clss)) {         
                        root.classList.remove(clss);
                    }             
                }
            }
        }
    }
}

// matchContext function to instantiate ContextQueryList Object with -- let varname = window.matchContext("(touch)") -- 
window.matchContext = function(expression) {
    var o = new ContextQueryList(expression, false);
    setTimeout(function(){
        if(typeof window.contextQueryObjectsList == "undefined") {
            window.contextQueryObjectsList = [];
        }
        window.contextQueryObjectsList.push(o);  
    },0)                              
    return o;
}


// event listener for devicelight
window.addEventListener('devicelight', function(e) {      
    let normalised = e.value / 10; // normalise range from 0 to 100, max value on nexus 4 is 1000
    //console.log(normalised);
    performContextCheck('devicelight',Math.round(normalised));
});
// event listener for devicemotion
let acceleration = 0;
window.addEventListener('devicemotion', function(e) {
    let accel = Math.round(Math.sqrt(e.acceleration.y*e.acceleration.y + e.acceleration.x*e.acceleration.x));   
    if (accel > acceleration || accel == 0) {
        //console.log(accel);
        acceleration = accel;
        performContextCheck('devicemotion', accel);
    }
});
// event listener for devicemotion
window.addEventListener('deviceproximity', function(e) {
    let normalise = ((e.value - e.min)/(e.max - e.min)) * 100;
    performContextCheck('deviceproximity',normalise);
});
// determine whether device is touch enabled on start
performContextCheck('touch', ('ontouchstart' in window || navigator.maxTouchPoints)?true:false);

let date = new Date(); 
const interval = 30000;

performContextCheck('time',(date.getHours() * 60) +  date.getMinutes());
setInterval(function(){
    let d = new Date(), hours = d.getHours(), minutes = d.getMinutes(), totalminutes = (hours * 60) + minutes;
    performContextCheck('time',totalminutes);
},interval);