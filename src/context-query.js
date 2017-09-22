/**
 * 
 */
export default class ContextQuery {
    constructor(query) {
        // 'Private'
        this._onchange = null;
        this._listeners = {};
        this._queries = undefined;
        this._queriesExpanded = {};
        this._intervalID = {};
        // 
        this._breakQueriesDown(query);
        // 'Public'
        this.context = query;
        this.matches = this._determineMatch();
        
        // attach event listeners
        this._registerListeners();
    }

    _registerListeners() {
        if(this.context.includes('light-intensity')) {
            window.addEventListener('devicelight', (e) => {      
                let normalised = e.value / 10; // normalise range from 0 to 100, max value on nexus 4 is 1000
                this._performContextCheck('light-intensity',Math.round(normalised));
            });
        } 
        if(this.context.includes('touch')) { 
            this._performContextCheck('touch', ('ontouchstart' in window || navigator.maxTouchPoints)?true:false);
        }
        if(this.context.includes('time')) {
            this._performContextCheck('time',(new Date().getHours() * 60) +  new Date().getMinutes());
            this._intervalID = setInterval(() => {
                this._performContextCheck('time',(new Date().getHours() * 60) +  new Date().getMinutes());
            },1000);
        }

        let acceleration = 0;
        if(this.context.includes('motion-speed')){           
            window.addEventListener('devicemotion', function(e) {
                let accel = Math.round(Math.sqrt(e.acceleration.y*e.acceleration.y + e.acceleration.x*e.acceleration.x));   
                if (accel > acceleration || accel == 0) {
                    acceleration = accel;
                    this._performContextCheck('motion-speed', accel);
                }
            });            
        }
        
        if(this.context.includes('charging-battery') || this.context.includes('battery') ) {
            navigator.getBattery().then((battery) => {
                if(this.context.includes('charging-battery')) { 
                    // Perform check on resolved promise then add change listener
                    this._performContextCheck('charging-battery',battery.charging);
                    battery.addEventListener('chargingchange',() => {         
                        this._performContextCheck('charging-battery',battery.charging);
                    });
                }
                if(this.context.includes('battery')) { 
                    this._performContextCheck('battery', battery.level * 100 );     
                    battery.addEventListener('levelchange', () => {
                        this._performContextCheck('battery', battery.level * 100 );
                    });
                }
            });
        }
    }

    /**   
     * @param {string} fname the name of the feature
     * @param {number} val the new numeric value
     */
    _performContextCheck(fname,val) {
        // update the values passed by the listeners of this._registerListeners() in the window.contextFeatures object
        for(let i of window.contextFeatures) {
            if(i.name == fname) {
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
    };

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
            if (stack[i].toString() === callback.toString()){
                stack.splice(i, 1);
                return;
            }
        }
    };

    /** 
     * @param {function} callback 
     */

    removeListener(callback) {
        this.removeEventListener("change", callback)
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
    };

    /** 
     * @param {function} callback 
     */

    set onchange(callback) {    
        if(typeof callback == "function") {
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
        function mixedSigns(arr,symbol) {
            let o = {left:false,right:false};
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
                        if( symbol === '<') {
                            o.left = true;
                        } else {
                            o.right = true;
                        }
                        
                    } else {
                        arr.push(tmpArr[0]);
                        arr.push(tmpArr[1]);
                        if( symbol === '<') {
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

        function findClosingBracket(start, str){
            let c = str.indexOf('(', start);
            let i = 1;
            while (i > 0) {
                let b = str[++c];
                if (b == '(') {
                    i++;
                }
                else if (b == ')') {
                    i--;
                }
            }
            return c;
        }

        let newCtxArr = {queries: []};

        /**
         * @param {string} obj an object representing all relations between the queries of which the context is composed 
         * @param {string} context the composed context 
         */

        function findQueriesRecursively(obj,context) {
            let q = '';
            if(context.indexOf('(') != 0) {
                q = context.substring(0, context.indexOf('('));
                context = context.replace(q,'');
            } else {
                q = context.substring(context.indexOf('(') + 1, findClosingBracket(context.indexOf('('),context));
                context = context.replace('('+q+')','');
            }
                  
            if(q !== ''){
                if( q.trim() == 'or' || q.trim() == 'and') {
                    obj.operator = q.trim();
                } else {
                    obj.queries.push(q.trim());
                }
                findQueriesRecursively(obj,context);
            } else {
                for(let i in obj.queries){
                    if(obj.queries[i].includes('and') || obj.queries[i].includes('or')){
                        context = obj.queries[i];
                        obj.queries[i] = {queries: []};
                        findQueriesRecursively(obj.queries[i],context);
                    }
                }
            }
        }

        findQueriesRecursively(newCtxArr,context.trim());
        this._queries = newCtxArr;
        
        
        function expandQueries(o) {
            for(let i in o.queries) {
                if(typeof o.queries[i] === 'object'){
                    expandQueries(o.queries[i]);
                } else {
                    let q = o.queries[i], ra, prcnt = '%', obj = {}, objName, incdec, lt = '<', gt = '>', lteq = '<=', gteq = '>=';
                    if( q.includes(lt) || q.includes(gt) ) {               
                        if (q.includes(lt) && q.includes(gt)) {
                            console.error('you have mixed the greater than and less than symbol in an expression!');
                            return;
                        }
                    
                        if (q.includes(lt)) {
                            if (q.includes(lteq)) {
                                ra = q.split(lteq);
                                incdec = mixedSigns(ra,lt);
                            } else {
                                ra = q.split(lt);
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
                            o.queries[i] = {};                 
                            o.queries[i] = obj;
                        }
                        if (q.includes(gt)) {
                            if (q.includes(gteq)) {
                                ra = q.split(gteq);
                                incdec = mixedSigns(ra,gt);
                            } else {
                                ra = q.split(gt);
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
                            o.queries[i] = {};                 
                            o.queries[i] = obj;
                            
                        }
                    } else if( q.includes(':')) {                
                        let a, objVal;          
                        a = q.split(/\s*:\s*/);
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
                                o.queries[i] = {};                 
                                o.queries[i] = obj;
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
                            o.queries[i] = {};                 
                            o.queries[i] = obj;
                        }
                    } else {
                        if(o.queries[i]) {
                            obj.feature = o.queries[i];
                            obj.abs = true;
                            o.queries[i] = {};                 
                            o.queries[i] = obj;
                        }  
                    }
                }
            }
            return o;
        }
        this._queriesExpanded = expandQueries(JSON.parse(JSON.stringify(newCtxArr)));
        
    }

    _determineMatch() {
        let b = false; 
        function determineIftrue(obj) {
                let b2 = true;
                for(let q of obj.queries) {
                    if(q.hasOwnProperty('operator')){
                        determineIftrue(q);
                    } else {
                        let min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY; 
                        for(let feature of window.contextFeatures ){
                            if(feature.name === q.feature) {
                                // Compare to values stored in Features object
                                //if(feature.supported) {
                                    // has an unique value either numeric or boolean
                                    if(q.hasOwnProperty('abs')) {
                                        if(Number.isInteger(q.abs)) {
                                            if(feature.value != q.abs) {
                                                b2 = false;
                                            } 
                                        } else {
                                            if(!feature.value) {
                                                b2 = false;
                                            }
                                        }
                                    } else {
                                        // Value is in range
                                        if(q.hasOwnProperty('min')) {
                                            min = q.min;
                                        }         
                                        if(q.hasOwnProperty('max')) {
                                            max = q.max;
                                        }
                                        if(q.hasOwnProperty('lt_gt')) {
                                            if(q.lt_gt.left) {
                                                ++min;
                                            } 
                                            if(q.lt_gt.right) {
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
                        if(obj.operator === 'or') {
                            // only one condition must be true
                            if(b2) {
                                b = true;
                            }
                        }
                        if(obj.operator === 'and') {
                            
                            if(!b2) {
                                b = false;
                            } 
                        }
                                 
                    }
                }
            
        }


        determineIftrue(this._queriesExpanded);

        if( b != this.matches ) {            
            if(this.matches == undefined) {
                return b;
            } else {
                this.matches = b;
                this.dispatchEvent(new CustomEvent("change", { detail: { matches: b, target: this }}));
            }           
        }
            
            
            
        /*
        let b = false;
        for (let j of this._queries) {
            let b2 = true;
            for(let k of j){             
                let min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY; 
                for(let feature of window.contextFeatures ){
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
        */
    }
}

// matchContext function to instantiate ContextQueryList Object with -- let varname = window.matchContext("(touch)") -- 
window.matchContext = function(expression) {
    let o = new ContextQuery(expression);
    console.log(o);            
    return o;
}

// new features structure
window.contextFeatures = [
    { name: 'light-intensity', value: null, supported: (function() { return ('ondevicelight' in window)?true:false }()) },
    { name: 'motion-speed', value: null, supported: (function() { return ('ondevicemotion' in window)?true:false }()) },
    { name: 'touch', value: null, supported: (function() { return ('ontouchstart' in window || navigator.maxTouchPoints)?true:false }()) },
    { name: 'time', value: null, supported: true },
    { name: 'battery', value: null, supported: (function() { return (navigator.getBattery)?true:false }()) },
    { name: 'charging-battery', value: null, callback: (function() { return (navigator.getBattery)?true:false }()) }
];