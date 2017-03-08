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

    content() {
        let inner = this.innerHTML;    
        if(inner.trim() != ''){
            generateContextStyles( inner.trim() );
        } else {
            console.error('Context-Styles have not been declared, please use the href attribute or write them directly in the context-style tag.');
        }
                
    }

    href() {
        let self = this;
        if(this.hasAttribute('href') && this.getAttribute('href') != "") {
            get(this.getAttribute('href')).then(function(response) {
                let rstr = response.replace(/>/g, '&gt;').replace(/</g, '&lt;');
                generateContextStyles(rstr);
                self.content();
            }, function(error) {
                console.error("Failed!", error);
            })
        } else {
            console.log('href empty or non existent');
            self.content();
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
function generateContextStyles(str) {
    
    let contexts = str.split('@context'), incdec = [false,false];
    contexts.splice(0,1);

    for (let i of contexts) {
        let arr = [],  arrOfObj = [], arrOfClasses = [], rules, ruleArr, styles, singleStyles, lt = '&lt;', gt = '&gt;', lteq = '&lt;=', gteq = '&gt;=';
        rules = i.substring(i.indexOf("("),i.indexOf("{"));

        if( rules.includes(lt) || rules.includes(gt) ) {
            rules = rules.substring(rules.indexOf("(")+1,rules.indexOf(")")), prcnt = '%', obj = {};
        
            if (rules.includes(lt) && rules.includes(gt)) {
                console.error('you have mixed the greater than and less than symbol in an expression!');
                return;
            }
        
            if (rules.includes(lt)) {
                if (rules.includes(lteq)) {
                    ruleArr = rules.split(lteq);
                    mixedSigns(ruleArr,lt,incdec);
                } else {
                    ruleArr = rules.split(lt);
                    incdec = [true,true];
                }         
                if(ruleArr.length == 2) {
                    if(ruleArr[0].includes(prcnt) || !isNaN(ruleArr[0])) {
                        obj['min-' + ruleArr[1].trim()] = parseFloat(ruleArr[0]);
                    } else {
                        obj['max-' + ruleArr[0].trim()] = parseFloat(ruleArr[1]);
                    }
                } else {
                    let obj2 = {};
                    obj2['min-' + ruleArr[1].trim()] = parseFloat(ruleArr[0]);
                    obj['max-' + ruleArr[1].trim()] = parseFloat(ruleArr[2]);
                    arrOfObj.push(obj2);
                }
                arrOfObj.push(obj);

            }
            if (rules.includes(gt)) {
                if (rules.includes(gteq)) {
                    ruleArr = rules.split(gteq);
                    mixedSigns(ruleArr,gt,incdec);
                } else {
                    ruleArr = rules.split(gt);
                    incdec = [true,true];
                } 
                if(ruleArr.length == 2) {
                    if(ruleArr[0].includes(prcnt) || !isNaN(ruleArr[0])) {
                        obj['max-' + ruleArr[1].trim()] = parseFloat(ruleArr[0]);
                    } else {
                        obj['min-' + ruleArr[0].trim()] = parseFloat(ruleArr[1]);
                    }
                    
                } else {
                    let obj2 = {};
                    obj['max-' + ruleArr[1].trim()] = parseFloat(ruleArr[0]);
                    obj2['min-' + ruleArr[1].trim()] = parseFloat(ruleArr[2]);
                    arrOfObj.push(obj2);
                }
                arrOfObj.push(obj);    
            }
        } else {
            ruleArr = rules.split('and');
            for (let j of ruleArr) {
                let obj = {}, inner, a;
                inner = j.substring(j.indexOf("(")+1,j.indexOf(")"));
                a = inner.split(':');                   
                obj[a[0]] = parseFloat(a[1]);
                arrOfObj.push(obj);
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
        if( incdec[0] || incdec[1] ) {
            arr.push(incdec);
        }  
        
        contextRules.push(arr);          
        
    }

    appendStyles(contextRules);
    
    // Show array on the console
    // console.log(contextRules);  
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
                css +=  suffix + (randomNum + len) + ' ' + key + '{' + Object.values(styl)[0] + '}';
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

// Add and remove the classes on the html tag
/**   
 * @param {string} fname
 * @param {number} val
 */
function performContextCheck(fname,val) {
    let len = contextRules.length;
    for (let i of contextRules) {
        let min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, fMin = 'min-' + fname, fMax = 'max-' + fname;
        len--;
        for (let j of i[0]) {
            if(Object.keys(j)[0] == fMin) {
                min = j[fMin];
            }         
            if(Object.keys(j)[0] == fMax) {
                max = j[fMax];
            }                        
        }
        if(i[2]) {
            if(i[2][0]) {
                ++min; 
            } 
            if(i[2][1]) {
                --max;
            }
        }       
        if(min != -Infinity || max != Infinity) {  
            for(let k of i[1]){
                let key = Object.keys(k)[0], clss = 'css-ctx-queries-' + (randomNum + len); //elmList, vals ,s;
                if( min <= val && val <= max ) {
                    if(!root.classList.contains(clss)){
                        //console.log('class added ' + clss + ' within min:' + min + ' max:' + max);
                        root.classList.add(clss);
                    }       
                } else if ( val < min || max < val) {
                    if(root.classList.contains(clss)) {
                        //console.log('class removed ' + clss + ' within min:' + min + ' max:' + max);
                        root.classList.remove(clss);
                    }             
                }
            }
        }
        
            
    }
}

// event listener for devicelight
window.addEventListener('devicelight', function(e) {
    performContextCheck('devicelight',e.value);
});
// event listener for devicemotion
window.addEventListener('devicemotion', function(e) {
    performContextCheck('devicemotion',(e.acceleration.x == null)?0:e.acceleration.x);
});