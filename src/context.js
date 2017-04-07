const randomNum = Math.floor(Math.random() * (900 - 701 +1)) + 701;

let root = document.querySelector("html"), contextRules = [];

class contextStyle extends HTMLElement {
    constructor() {
        super(); 
    }

    connectedCallback() {
        this.href();
        this.style.display = 'none';     
    }

    content(attrctx) {
        let inner = this.innerHTML;    
        if(inner.trim() != ''){
            generateContextStyles( inner.trim(), attrctx );
        } else {
            console.error('Context-Styles have not been declared, please use the href attribute or write them directly in the context-style tag.');
        }
                
    }

    href() {
        let self = this, attrctx = false;
        if(this.hasAttribute('context') && this.getAttribute('context') != "") {
            attrctx = this.getAttribute('context').replace(/>/g, '&gt;').replace(/</g, '&lt;');
        } 
        if(this.hasAttribute('href') && this.getAttribute('href') != "") {
            get(this.getAttribute('href')).then(function(response) {
                let rstr = response.replace(/>/g, '&gt;').replace(/</g, '&lt;');
                generateContextStyles(rstr, attrctx);
                self.content(attrctx);
            }, function(error) {
                console.error("Failed!", error);
            })
        } else {
            console.log('href empty or non existent');
            self.content(attrctx);
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
                    indc[0] = true;
                } else {
                    indc[1] = true;
                }
                
            } else {
                arr.push(tmpArr[0]);
                arr.push(tmpArr[1]);
                if( symbol === '&lt;') {
                    indc[1] = true;
                } else {
                    indc[0] = true;
                }
            }
        }
        
        //console.log(arr);
    }
}

/**
 * @param {string} str
 */
function generateContextStyles(str, attrctx) {
    
    let contexts = str.split('@context'), innerctx = true;
    contexts.splice(0,1);
    if(contexts.length < 1 && attrctx ) {
        contexts = [];
        let andAttr = attrctx.split(','), cnt = 0;
        for (let sar of andAttr) {
            contexts[cnt++] = sar + '{' + str + '}}';
        }
        innerctx = false;
    }

    for (let i of contexts) {
        
        let rules, ruleArr, lt = '&lt;', gt = '&gt;', lteq = '&lt;=', gteq = '&gt;=';
        rules = i.substring(i.indexOf("("),i.indexOf("{"));
        ruleArr = rules.split(',');

        if(innerctx && attrctx) {
            let andAttr = attrctx.split(','), newRuleArr = [];
            for (let sar of andAttr) {
                for (let y in ruleArr) {
                    newRuleArr.push( ruleArr[y] + ' and ' + sar);
                }
            }
            ruleArr = newRuleArr;
        }

        for (let y of ruleArr) {
            let arr = [],  arrOfObj = [], arrOfClasses = [], styles, singleStyles;
            let andArr = y.split('and');

            for (let j of andArr) {
                let sr = j.substring(j.indexOf("(")+1,j.indexOf(")")), ra, prcnt = '%', obj = {}, obj2 = {}, objName, incdec = [false,false];
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
                            incdec = [true,true];   	
                        }  
                        if(ra.length == 2) {
                            if(ra[0].includes(prcnt) || !isNaN(ra[0])) {
                                objName = ra[1].trim();
                                obj2['min'] = parseFloat(ra[0]);
                            } else {
                                obj2['max'] = parseFloat(ra[1]);
                                objName = ra[0].trim();
                            }
                        } else {
                            objName = ra[1].trim();
                            obj2['min'] = parseFloat(ra[0]);
                            obj2['max'] = parseFloat(ra[2]);
                        }
                        obj[objName] = obj2;
                        if( incdec[0] || incdec[1] ) {
                            obj[objName]['lt_gt'] = incdec;
                        }
                        arrOfObj.push(obj);

                    }
                    if (sr.includes(gt)) {
                        if (sr.includes(gteq)) {
                            ra = sr.split(gteq);
                            mixedSigns(ra,gt,incdec);
                        } else {
                            ra = sr.split(gt);
                            incdec = [true,true];
                        } 
                        if(ra.length == 2) {
                            if(ra[0].includes(prcnt) || !isNaN(ra[0])) {
                                obj2['max'] = parseFloat(ra[0]);
                                objName = ra[1].trim();
                            } else {
                                obj2['min'] = parseFloat(ra[1]);
                                objName = ra[0].trim();
                            }
                            
                        } else {
                            objName = ra[1].trim();
                            obj2['max'] = parseFloat(ra[0]);
                            obj2['min'] = parseFloat(ra[2]);
                        }
                        obj[objName] = obj2;
                        if( incdec[0] || incdec[1] ) {
                            obj[objName]['lt_gt'] = incdec;
                        } 
                        
                        arrOfObj.push(obj);
                    }
                } else {                
                    let obj = {}, inner, a, incmin = 'min-', incmax = 'max-', objVal;
                    inner = j.substring(j.indexOf("(")+1,j.indexOf(")"));           
                    a = inner.split(':');

                    objName = a[0].trim();
                    objName = objName.replace('min-','');
                    objName = objName.replace('max-','');

                    objVal = parseFloat(a[1]);
                    
                        
                    if(arrOfObj.length == 0) {
                        if(a[0].includes(incmin)) {
                            obj2['min'] = objVal;
                        }

                        if(a[0].includes(incmax)) {
                            obj2['max'] = objVal;
                        }
                        obj[objName] = obj2;                    
                        arrOfObj.push(obj);
                    } else {
                            for(let i of arrOfObj) {
                            if(Object.keys(i)[0] != objName) {
                                if(a[0].includes(incmin)) {
                                    obj2['min'] = objVal;
                                }

                                if(a[0].includes(incmax)) {
                                    obj2['max'] = objVal;
                                }
                                obj[objName] = obj2;
                                arrOfObj.push(obj);
                            } else {
                                if(a[0].includes(incmin)) {
                                    i[objName]['min'] = objVal;
                                }

                                if(a[0].includes(incmax)) {
                                    i[objName]['max'] = objVal;
                                } 
                            }
                        }
                    }      
                }
            }

            styles = i.substring(i.indexOf("{") + 1,i.lastIndexOf("}"));
            singleStyles = styles.split('}');
            singleStyles.pop();
            
            for (let z of singleStyles){
                let classes, attrs, classArr; 
                classes = z.substring(0,z.indexOf("{"));
                attrs =  z.substring(z.indexOf("{") + 1);                             
                classArr = classes.split(',');
                for(let sc of classArr) {
                    let obj = {};
                    obj[sc.trim()] =  attrs.trim(); 
                    arrOfClasses.push(obj);
                }
            }  
            arr.push(arrOfObj);           
            arr.push(arrOfClasses); 
            
            contextRules.push(arr);
        }

    }

    appendStyles(contextRules);
    
    // Show array on the console
    console.log(contextRules);  
}

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

// Append generated styles to head tag
function appendStyles() {
    let head = document.querySelector('head'), style = document.createElement('style'), len = contextRules.length, 
    suffix = '.css-ctx-queries-',css = "";
    style.type = 'text/css';
    style.id = 'cssCtxQueriesStyleTag';
    for(let i of contextRules) {
        len--;
        for(let styl of i[1]) {
            let key = Object.keys(styl)[0];
            if(key === 'html') {
                css += key + suffix + (randomNum + len) + '{' + Object.values(styl)[0] + '}';
            } else {
                css +=  suffix + (randomNum + len) + ' ' + key.replace('&gt;','>') + '{' + Object.values(styl)[0] + '}'; // ">" selector
            }            
        }
    }
    if(document.getElementById('cssCtxQueriesStyleTag')) {
        document.getElementById('cssCtxQueriesStyleTag').innerHTML = "";
        document.getElementById('cssCtxQueriesStyleTag').appendChild(document.createTextNode(css));
    } else {
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }
}

let features = {
    devicelight:null,
    devicemotion:null,
    deviceproximity:null
};

// update de features object based on event listener
/**   
 * @param {string} fname
 * @param {number} val
 */
function updateFeatVal(n,v) {
    Object.keys(features).forEach(function(k){
        if(k === n) {
            features[k] = v;
        }       
    });
}

// Add and remove the classes on the html tag
/**   
 * @param {string} fname
 * @param {number} val
 */

function performContextCheck(fname,val) {
    updateFeatVal(fname,val);
    //console.log(features); 
    let len = contextRules.length;
    for (let i of contextRules) {
        len--;
        let min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, clss = 'css-ctx-queries-' + (randomNum + len), v, b = true;

        for (let j of i[0]) {
            let k = Object.keys(j)[0]; 

            Object.keys(features).forEach(function(key){
                if(key === k) {
                    v = features[key];
                    
                    if(j[k].hasOwnProperty('min')) {
                        min = j[k].min;
                    }         
                    if(j[k].hasOwnProperty('max')) {
                        max = j[k].max;
                    }
                    if(j[k].hasOwnProperty('lt_gt')) {
                        if(j[k]['lt_gt'][0]) {
                            ++min; 
                        } 
                        if(j[k]['lt_gt'][1]) {
                            --max;
                        }
                    }
                    if(min != -Infinity || max != Infinity) {                                      
                        if ( v < min || max < v) {
                            b = false;
                        }         
                    }
                }       
            });
                                                
        }
        
        if( b ) {
            if(!root.classList.contains(clss)){
                //console.log('class added ' + clss + ' within min:' + min + ' max:' + max);
                root.classList.add(clss);
            }       
        } else  {
            if(root.classList.contains(clss)) {
                //console.log('class removed ' + clss + ' within min:' + min + ' max:' + max);
                root.classList.remove(clss);
            }             
        }      
    
    }
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