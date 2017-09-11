/**
 * 
 */
export default class ContextQuery {
    constructor(query) {
        // 'Private'
        this._onchange = null;
        this._listeners = {};
        this._queries = this._breakQueriesDown(query);
        this._intervalID = undefined;
        // 'Public'
        this.context = query;
        this.matches = this._determineMatch();
        // attach event listeners
        this._registerListeners();
    }

    _registerListeners() {
        window.addEventListener('devicelight', (e) => {      
            let normalised = e.value / 10; // normalise range from 0 to 100, max value on nexus 4 is 1000
            this._performContextCheck('devicelight',Math.round(normalised));
        });
        this._performContextCheck('touch', ('ontouchstart' in window || navigator.maxTouchPoints)?true:false);
        this._performContextCheck('time',(new Date().getHours() * 60) +  new Date().getMinutes());
        this._intervalID = setInterval(() => {
            this._performContextCheck('time',(new Date().getHours() * 60) +  new Date().getMinutes());
        },1000);
        navigator.getBattery().then(function(battery) {
            battery.addEventListener('chargingchange',function(){
                this._performContextCheck('charging-battery',battery.charging);
            });
            battery.addEventListener('levelchange', function(){
                this._performContextCheck('battery', battery.level * 100 + '%');
            });
        });
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
        let arrayOfContexts = [], or = /\s*,\s*|\s*or\s*/i, orArr = context.split(or), lt = '<', gt = '>', lteq = '<=', gteq = '>=';
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

    _determineMatch() {
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
    }
}

// matchContext function to instantiate ContextQueryList Object with -- let varname = window.matchContext("(touch)") -- 
window.matchContext = function(expression) {                   
    return new ContextQuery(expression);
}