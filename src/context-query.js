/**
 *
 */
// new features structure
window.contextFeatures = [
  {
    name: "light-intensity",
    value: null,
    supported: "ondevicelight" in window ? true : false
  },
  {
    name: "motion-speed",
    value: null,
    supported: "ondevicemotion" in window ? true : false
  },
  {
    name: "touch",
    value: null,
    supported:
      "ontouchstart" in window || navigator.maxTouchPoints ? true : false
  },
  { name: "time", value: null, supported: true },
  {
    name: "battery",
    value: null,
    supported: "getBattery" in navigator ? true : false
  },
  {
    name: "charging-battery",
    value: null,
    supported: "getBattery" in navigator ? true : false
  }
];

export default class ContextQuery {
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
    for (let feature of window.contextFeatures) {
      if (feature.supported && this.context.includes(feature.name)) {
        switch (feature.name) {
          case "light-intensity":
            window.addEventListener("devicelight", e => {
              let normalised = e.value / 10; // normalise range from 0 to 100, max value on nexus 4 is 1000
              this._performContextCheck(
                "light-intensity",
                Math.round(normalised)
              );
            });
            break;
          case "touch":
            this._performContextCheck(
              "touch",
              "ontouchstart" in window || navigator.maxTouchPoints
                ? true
                : false
            );
            break;
          case "time":
            this._performContextCheck(
              "time",
              new Date().getHours() * 60 + new Date().getMinutes()
            );
            this._intervalID = setInterval(() => {
              this._performContextCheck(
                "time",
                new Date().getHours() * 60 + new Date().getMinutes()
              );
            }, 1000);
            break;
          case "motion-speed":
            let acceleration = 0;
            window.addEventListener("devicemotion", function(e) {
              let accel = Math.round(
                Math.sqrt(
                  e.acceleration.y * e.acceleration.y +
                    e.acceleration.x * e.acceleration.x
                )
              );
              if (accel > acceleration || accel == 0) {
                acceleration = accel;
                this._performContextCheck("motion-speed", accel);
              }
            });
            break;
          case "battery":
            navigator.getBattery().then(battery => {
              this._performContextCheck("battery", battery.level * 100);
              battery.addEventListener("levelchange", () => {
                this._performContextCheck("battery", battery.level * 100);
              });
            });
            break;
          case "charging-battery":
            navigator.getBattery().then(battery => {
              // Perform check on resolved promise then add change listener
              this._performContextCheck("charging-battery", battery.charging);
              battery.addEventListener("chargingchange", () => {
                this._performContextCheck("charging-battery", battery.charging);
              });
            });
            break;
        }
      }
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
            if (symbol === "<") {
              o.left = true;
            } else {
              o.right = true;
            }
          } else {
            arr.push(tmpArr[0]);
            arr.push(tmpArr[1]);
            if (symbol === "<") {
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
      let c = str.indexOf("(", start);
      let i = 1;
      while (i > 0) {
        let b = str[++c];
        if (b == "(") {
          i++;
        } else if (b == ")") {
          i--;
        }
      }
      return c;
    }

    let tree = { queries: [] };

    /**
     * @param {object} obj an object representing all relations between the queries of which the context is composed
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

    function createQueryTreeRecursively(obj, context) {
      let q = "",
        idx = context.indexOf("(");

      // check if the expression has prefix 'not', if so set idx to 0
      if (context.substring(idx - 3, idx) === "not") {
        idx = idx - 3;
      }
      // if idx != 0 we're dealing with an operator
      if (idx != 0) {
        q = context.substring(0, idx);
      } else {
        q = context.substring(idx, findClosingBracket(idx, context) + 1);
      }
      // replace the substring
      context = context.replace(q, "");
      q = q.trim();

      if (q !== "") {
        if (q == "or" || q == "and") {
          obj.operator = q;
        } else {
          if (!q.includes("and") && !q.includes("or")) {
            let ra,
              prcnt = "%",
              objct = {},
              objName,
              incdec,
              lt = "<",
              gt = ">",
              lteq = "<=",
              gteq = ">=";
            if (q.substring(q.indexOf("(") - 3, q.indexOf("(")) === "not") {
              objct.negate = true;
            }
            objct.context = q.substring(q.indexOf("(") + 1, q.indexOf(")"));
            if (objct.context.includes(lt) || objct.context.includes(gt)) {
              if (objct.context.includes(lt) && objct.context.includes(gt)) {
                console.error(
                  "you have mixed the greater than and less than symbol in an expression!"
                );
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
            } else if (objct.context.includes(":")) {
              let a, objVal;
              a = objct.context.split(/\s*:\s*/);
              objName = a[0].trim();
              objct.feature = objName;
              objVal = parseFloat(a[1]);

              if (objName.includes("min-") || objName.includes("max-")) {
                objName = objName.replace("min-", "");
                objName = objName.replace("max-", "");
                objct.feature = objName;
                if (a[0].includes("min-")) {
                  objct.min = objVal;
                }
                if (a[0].includes("max-")) {
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
        createQueryTreeRecursively(obj, context);
      } else {
        for (let i in obj.queries) {
          if (typeof obj.queries[i] === "string") {
            context = obj.queries[i];
            obj.queries[i] = { queries: [] };
            if (
              context.substring(
                context.indexOf("(") - 3,
                context.indexOf("(")
              ) === "not"
            ) {
              context = context.replace("not", "");
              obj.queries[i].negate = true;
            }
            context = context.substring(
              context.indexOf("(") + 1,
              findClosingBracket(context.indexOf("("), context)
            );

            createQueryTreeRecursively(obj.queries[i], context);
          }
        }
      }
    }

    createQueryTreeRecursively(tree, context.trim());

    return tree;
  }

  _determineMatch() {
    /**
     * @param {object} obj the object representing the combined queries in a tree-like structure
     */
    function evaluateQueriesRecursively(obj) {
      let tmp, operator;

      // check if the combined query has been prefixed with 'not', if so invert the operators
      if (obj.hasOwnProperty("negate")) {
        if (obj.operator === "and") {
          operator = "or";
        } else if (obj.operator === "or") {
          operator = "and";
        }
      } else {
        operator = obj.operator;
      }

      for (let q of obj.queries) {
        if (!q.hasOwnProperty("queries")) {
          let b1 = true,
            min = Number.NEGATIVE_INFINITY,
            max = Number.POSITIVE_INFINITY;
          for (let feature of window.contextFeatures) {
            if (feature.name === q.feature) {
              // Compare to values stored in Features object
              if (feature.supported) {
                // has an unique value either numeric or boolean
                if (q.hasOwnProperty("abs")) {
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
                  if (q.hasOwnProperty("min")) {
                    min = q.min;
                  }
                  if (q.hasOwnProperty("max")) {
                    max = q.max;
                  }
                  if (q.hasOwnProperty("lt_gt")) {
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
                if (q.hasOwnProperty("negate")) {
                  b1 = !b1;
                }
              } else {
                b1 = false;
              }
            }
          }
          if (obj.hasOwnProperty("negate")) {
            b1 = !b1;
          }

          if (obj.queries.indexOf(q) === 0) {
            tmp = b1;
          } else {
            if (operator === "and") {
              tmp = tmp && b1;
            }
            if (operator === "or") {
              tmp = tmp || b1;
            }
          }
        } else {
          if (obj.queries.indexOf(q) !== 0) {
            if (operator === "and") {
              tmp = tmp && evaluateQueriesRecursively(q);
            }
            if (operator === "or") {
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
        this.dispatchEvent(
          new CustomEvent("change", { detail: { matches: b, target: this } })
        );
      }
    }
  }
}

// matchContext function to instantiate ContextQueryList Object with -- let varname = window.matchContext("(touch)") --
window.matchContext = function(expression) {
  let o = new ContextQuery(expression);
  //console.log(o);
  return o;
};
