!function(e){function r(e,r,t){e in l||(l[e]={name:e,declarative:!0,deps:r,declare:t,normalizedDeps:r})}function t(e){return p[e]||(p[e]={name:e,dependencies:[],exports:{},importers:[]})}function n(r){if(!r.module){var o=r.module=t(r.name),a=r.module.exports,u=r.declare.call(e,function(e,r){if(o.locked=!0,"object"==typeof e)for(var t in e)a[t]=e[t];else a[e]=r;for(var n=0,u=o.importers.length;u>n;n++){var i=o.importers[n];if(!i.locked)for(var l=0;l<i.dependencies.length;++l)i.dependencies[l]===o&&i.setters[l](a)}return o.locked=!1,r},r.name);o.setters=u.setters,o.execute=u.execute;for(var s=0,d=r.normalizedDeps.length;d>s;s++){var f,c=r.normalizedDeps[s],v=l[c],m=p[c];m?f=m.exports:v&&!v.declarative?f=v.esModule:v?(n(v),m=v.module,f=m.exports):f=i(c),m&&m.importers?(m.importers.push(o),o.dependencies.push(m)):o.dependencies.push(null),o.setters[s]&&o.setters[s](f)}}}function o(r){var t={};if(("object"==typeof r||"function"==typeof r)&&r!==e)if(d)for(var n in r)"default"!==n&&a(t,r,n);else{var o=r&&r.hasOwnProperty;for(var n in r)"default"===n||o&&!r.hasOwnProperty(n)||(t[n]=r[n])}return t["default"]=r,c(t,"__useDefault",{value:!0}),t}function a(e,r,t){try{var n;(n=Object.getOwnPropertyDescriptor(r,t))&&c(e,t,n)}catch(o){return e[t]=r[t],!1}}function u(r,t){var n=l[r];if(n&&!n.evaluated&&n.declarative){t.push(r);for(var o=0,a=n.normalizedDeps.length;a>o;o++){var d=n.normalizedDeps[o];-1==s.call(t,d)&&(l[d]?u(d,t):i(d))}n.evaluated||(n.evaluated=!0,n.module.execute.call(e))}}function i(e){if(m[e])return m[e];if("@node/"==e.substr(0,6))return m[e]=o(v(e.substr(6)));var r=l[e];if(!r)throw"Module "+e+" not present.";return n(l[e]),u(e,[]),l[e]=void 0,r.declarative&&c(r.module.exports,"__esModule",{value:!0}),m[e]=r.declarative?r.module.exports:r.esModule}var l={},s=Array.prototype.indexOf||function(e){for(var r=0,t=this.length;t>r;r++)if(this[r]===e)return r;return-1},d=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(f){d=!1}var c;!function(){try{Object.defineProperty({},"a",{})&&(c=Object.defineProperty)}catch(e){c=function(e,r,t){try{e[r]=t.value||t.get.call(e)}catch(n){}}}}();var p={},v="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&require.resolve&&"undefined"!=typeof process&&require,m={"@empty":{}};return function(e,t,n,a){return function(u){u(function(u){for(var l=0;l<t.length;l++)(function(e,r){r&&r.__esModule?m[e]=r:m[e]=o(r)})(t[l],arguments[l]);a({register:r});var s=i(e[0]);if(e.length>1)for(var l=1;l<e.length;l++)i(e[l]);return n?s["default"]:s})}}}("undefined"!=typeof self?self:global)

(["1"], [], false, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.register('2', ['3', '4'], function (_export, _context) {
  "use strict";

  var PROFILE_CHANGED_EVENT, PROFILE_REQUEST_EVENT, AdaptiveVariant;
  return {
    setters: [function (_) {
      PROFILE_CHANGED_EVENT = _.PROFILE_CHANGED_EVENT;
      PROFILE_REQUEST_EVENT = _.PROFILE_REQUEST_EVENT;
    }, function (_2) {
      AdaptiveVariant = _2.default;
    }],
    execute: function () {
      _export('default', superclass => {
        /**
         * The {@link AdaptiveVariant}s of this component type.
         * @memberof AdaptiveComponent
         * @type {Class[]} subclasses of {@link AdaptiveVariant}
         * @static
         * @private
         */
        let _variantTypes = new Array();

        /**
         * The default {@link AdaptiveVariant} of this component type.
         * @memberof AdaptiveComponent
         * @type {Class} subclass of {@link AdaptiveVariant}
         * @static
         * @private
         */
        let _defaultVariantType = null;

        /**
         * Mixin for Adaptive Web Component classes.
         */
        class AdaptiveComponent extends superclass {
          constructor() {
            super();

            /**
             * The instance of the current variant.
             * @member {AdaptiveVariant}
             * @private
             */
            this._currentVariant = null;

            /**
             * The instance of the variant that is prepared to become the current one.
             * @member {AdaptiveVariant}
             * @private
             */
            this._preparedVariant = null;

            /**
             * The node this component listens on for {@link PROFILE_CHANGED_EVENT}s
             * @member {Node}
             * @private
             */
            this._profileEventNode = null;

            /**
             * Handler for {@link PROFILE_CHANGED_EVENT}s that is bound to this component.
             * @member {Function}
             * @private
             */
            this._profileChangeHandler = this._profileChanged.bind(this);

            /**
             * Indicates if the component manages its decendants in its shadow DOM.
             * @member {Boolean}
             * @private
             */
            this._managing = false;

            /**
             * The collection of decentant components managed by this component.
             * @member {AdaptiveComponent[]}
             * @private
             */
            this._managedComponents = new Array();

            /**
             * The most recent profile this component received in managing mode, <code>null</code> if
             * this component is not managing.
             * @member {Object}
             * @private
             */
            this._currentProfile = null;

            /**
             * Handler for {@link PROFILE_REQUEST_EVENT}s that is bound to this component.
             * @member {Function}
             * @private
             */
            this._profileRequestHandler = this._profileRequest.bind(this);

            /**
             * Indicates if the component is managed by another component.
             * @member {Boolean}
             * @private
             */
            this._managedBy = null;

            // Create shadow dom
            this.attachShadow({ mode: 'open' });

            console.log(`${this.constructor.name}("${this.localName}") constructed`);
          }

          /**
           * The current {@link AdaptiveVariant} instance for this component.
           * @readonly
           * @returns {AdaptiveVariant} the current variant's instance.
           */
          get variant() {
            return this._currentVariant;
          }

          /**
           * Indicates if this component is managing its decentants or behaves transparent in terms 
           * of {@link PROFILE_REQUEST_EVENT}s from the decentants in its shadow DOM.
           * @returns {Boolean} <code>true</code> if the component is managing, <code>false</code> if not. 
           */
          get managing() {
            return this._managing;
          }

          /**
           * Sets this component to managing mode or transparent mode (default). In managing mode, it manages the 
           * adaptation behavior of the decentants in its shadow DOM. In transparent mode, it does not influence
           * the bubbling of {@link PROFILE_REQUEST_EVENT}s comming from its shadow DOM.
           * @param {Boolean} flag <code>true</code> to set the component to managing mode, 
           *        <code>false</code> to set it to transparent mode.
           */
          set managing(flag) {
            if (this._managing == flag) {
              return;
            }

            this._managing = flag;

            // Sync with attribute if required
            const attributeName = AWC_ATTRIBUTE_PREFIX + 'managing';
            if (this._managing && !this.hasAttribute(attributeName)) {
              this.setAttribute(attributeName, '');
            } else if (!this._managing && this.hasAttribute(attributeName)) {
              this.removeAttribute(attributeName, '');
            }

            if (this._managing) {
              // Set up managing functions
              this.shadowRoot.addEventListener(PROFILE_REQUEST_EVENT, this._profileRequestHandler);
            } else {
              // Remove managing functions
              this.shadowRoot.removeEventListener(PROFILE_REQUEST_EVENT, this._profileRequestHandler);

              this._currentProfile = null;
            }
          }

          /**
           * Indicates if this components adaptation is managed by another component. If in managed mode, 
           * this component does not itself listen to {@link PROFILE_CHANGED_EVENT}s. Instead, the managing
           * component will call {@link #prepareAdaptation} and {@link #performAdaptation} directly.
           * @readonly
           * @returns {Boolean} <code>true</code> if the component is managed, <code>false</code> if not. 
           */
          get managed() {
            return this._managedBy != null;
          }

          /**
           * Called when the instance of the component has been connected to, i.e. 
           * inserted into a document.
           */
          connectedCallback() {
            console.log(`${this.constructor.name}("${this.localName}").connectedCallback`);

            // Initialize default variant
            if (this._currentVariant == null && this._preparedVariant == null) {
              this.prepareAdaptation({});
            }
            if (this._currentVariant == null && this._preparedVariant != null) {
              this.performAdaptation({});
            }

            // Request initial profile
            if (this._profileEventNode == null) {
              this.dispatchEvent(new CustomEvent(PROFILE_REQUEST_EVENT, {
                bubbles: true, // bubbles along the DOM tree towards its root (i.e. window)
                composed: true, // bubbles across shadow DOM boundaries
                cancelable: true, // can be canceled by listeners
                detail: {
                  callback: (profile, source) => {
                    console.log(`${this.constructor.name}("${this.localName}") received profile ${JSON.stringify(profile)} from ${source}`);
                    // Adapt to profile, but only once
                    if (this._profileEventNode == null) {
                      this.prepareAdaptation(profile);
                      this.performAdaptation(profile);

                      this._profileEventNode = source;
                      // Register to profile change events
                      this._profileEventNode.addEventListener(PROFILE_CHANGED_EVENT, this._profileChangeHandler);
                    }
                  },
                  managedCallback: manager => {
                    console.log(`${this.constructor.name}("${this.localName}") is managed by ${manager}`);
                    this._managedBy = manager;
                  }
                }
              }));
            }
          }

          /**
           * Called when the instance of the component has been disconnected from, i.e. 
           * removed from a document.
           */
          disconnectedCallback() {
            console.log(`${this.constructor.name}("${this.localName}").disconnectedCallback`);

            if (this._profileEventNode != null) {
              // Unregister from profile change events in self-adaptive mode
              this._profileEventNode.removeEventListener(PROFILE_CHANGED_EVENT, this._profileChangeHandler);
              this._profileEventNode = null;
            }
            if (this._managedBy != null) {
              // Notify manager in managed mode
              this._managedBy.removeManagedComponent(this);
              this._managedBy = null;
            }
          }

          /**
           * Defines the attributes that are observed, i.e. for which attributes the 
           * {@link #attributeChangedCallback} will be called.
           * 
           * @readonly
           * @static
           */
          static get observedAttributes() {
            return [AWC_ATTRIBUTE_PREFIX + 'managing'];
          }

          /**
           * Called when an attribute was added, removed or modified at the instance 
           * of the component.
           * 
           * @param {String} attrName The name of the changed attribute.
           * @param {Any} oldVal The old value of the attribute.
           * @param {Any} newVal The new value of the attribute.
           */
          attributeChangedCallback(attrName, oldVal, newVal) {
            console.log(`${this.constructor.name}("${this.localName}").attributeChangedCallback: ${attrName}, ${oldVal}, ${newVal}`);

            if (attrName == AWC_ATTRIBUTE_PREFIX + 'managing') {
              this.managing = this.hasAttribute(AWC_ATTRIBUTE_PREFIX + 'managing');
            }
          }

          /**
           * Called when the instance of the component has been adopted by another document.
           * 
           * @param {Document} oldDocument The document the element has been taken from.
           * @param {Document} newDocument The document the element has been adpoted by.
           */
          adoptedCallback(oldDocument, newDocument) {}

          /**
           * Prepares the adaptation of the component according to the given profile.
           * 
           * @param {Object} profile The profile to adapt to.
           */
          prepareAdaptation(profile) {
            // Determine matching variant type
            let newVariantType = this._selectFirstMatchingVariantType(profile);

            if (newVariantType == null) {
              // Uh-oh, not even a default variant?!
              console.warn(`${this.localName} has not been able to select a variant!`);
              return;
            }

            if (this._currentVariant != null && newVariantType == Object.getPrototypeOf(this._currentVariant).constructor) {
              // No adaptation required in this component, because the selected variant is already the current one
              this._prepareManagedComponents(profile);
              return;
            }

            // Create instance of selected variant
            this._preparedVariant = new newVariantType();

            // Notify current variant
            let variantState = {};
            if (this._currentVariant != null) {
              variantState = this._currentVariant.deselectedCallback();
            }

            // Notify prepared variant
            this._preparedVariant.selectedCallback(variantState);

            // Prepare managed components
            this._prepareManagedComponents(profile);
          }

          /**
           * Performes the adaptation of the component according to the given profile.
           * 
           * @param {Object} profile The profile to adapt to.
           */
          performAdaptation(profile) {
            // No adaptation if no variant prepared or prepared variant is already the current one
            if (this._preparedVariant == null || this._preparedVariant == this._currentVariant) {
              this._adaptManagedComponents(profile);
              return;
            }

            // Disconnect current variant
            if (this._currentVariant != null) {
              this._currentVariant.disconnectedCallback();
              this._currentVariant.contentRoot = null;
            }

            // Remove current variant's contents
            while (this.shadowRoot.firstChild) {
              this.shadowRoot.removeChild(this.shadowRoot.firstChild);
            }

            // Connect prepared variant
            this._preparedVariant.contentRoot = this.shadowRoot;
            this._preparedVariant.connectedCallback();

            // Prepared variant now is the current variant
            this._currentVariant = this._preparedVariant;
            this._preparedVariant = null;

            // Adapt managed components
            this._adaptManagedComponents(profile);
          }

          /**
           * Event handling routine for {@link PROFILE_CHANGED_EVENT}s.
           * 
           * @param {CustomEvent} event The custom event carrying the detailed profile changes and new profile.
           * 
           * @private
           */
          _profileChanged(event) {
            console.log(`${this.constructor.name}("${this.localName}")._profileChanged:`, event.detail);

            let profile = event.detail.current;
            this.prepareAdaptation(profile);
            this.performAdaptation(profile);
          }

          /**
           * Selects the first variant matching the given profile.
           * 
           * @param {Object} profile 
           * @returns {Class} Subclass of {@link AdaptiveVariant}
           * 
           * @private
           */
          _selectFirstMatchingVariantType(profile) {
            let firstMatch = null;
            _variantTypes.every(function (variantType) {
              if (variantType.matches(profile)) {
                firstMatch = variantType;
                return false;
              }
              return true;
            });

            return firstMatch != null ? firstMatch : _defaultVariantType;
          }

          /**
           * Event handling routine for {@link PROFILE_REQUEST_EVENT}s.
           * 
           * @param {CustomEvent} event The custom event representing the request for a profile.
           * 
           * @private
           */
          _profileRequest(event) {
            console.log(`${this.constructor.name}("${this.localName}")._profileRequest from `, event.target);

            // Add requesting component to managed components
            let component = event.target;
            this._managedComponents.push(component);
            event.detail.managedCallback(this);

            // Adapt requesting component to current profile
            if (this._currentProfile != null) {
              component.prepareAdaptation(this._currentProfile);
              component.performAdaptation(this._currentProfile);
            }

            // Stop further handling of this request
            event.stopImmediatePropagation();
          }

          /**
           * Removes a component from the list of managed components. Typically because it has been removed
           * from the shadow DOM of this component and should therefore no further be managed.
           * 
           * @param {AdaptiveComponent} component The component to be removed.
           */
          removeManagedComponent(component) {
            console.log(`${this.constructor.name}("${this.localName}").removeManagedComponent:`, component);

            // If removed component is managed by this component
            let index = this._managedComponents.indexOf(component);
            if (index > -1) {
              // Remove component from managed components
              this._managedComponents.splice(index, 1);
            }
          }

          /**
           * Prepares the adaptation of all managed components.
           * 
           * @param {Object} profile The profile to adapt to.
           * 
           * @private
           */
          _prepareManagedComponents(profile) {
            if (!this._managing) {
              return;
            }

            this._managedComponents.forEach(component => {
              component.prepareAdaptation(profile);
            });
          }

          /**
           * Performs the adaptation of all managed components.
           * 
           * @param {Object} profile The profile to adapt to.
           * 
           * @private
           */
          _adaptManagedComponents(profile) {
            if (!this._managing) {
              return;
            }

            this._currentProfile = profile;

            this._managedComponents.forEach(component => {
              component.performAdaptation(profile);
            });
          }

          /**
           * Registers a variant for this component.
           * 
           * @param {Class} variant The subclass of {@link AdaptiveVariant} to register.
           * @static
           */
          static registerVariant(variant) {
            // Add to variants of this component
            _variantTypes.push(variant);

            // Set the first registered variant as the default variant
            if (_variantTypes.length == 1) {
              AdaptiveComponent.defaultVariant = variant;
            }
          }

          /**
           * Sets an already registered variant as the default variant for this component.
           * 
           * @param {Class} variant The registered subclass of {@link AdaptiveVariant} that should be used as default variant.
           * 
           * @throws {Error} If 'variant' is not a registered variant of this component.
           * 
           * @static
           */
          static set defaultVariant(variant) {
            if (_variantTypes.indexOf(variant) < 0) {
              throw new Error('Provided variant is not registered for this component.');
            }

            _defaultVariantType = variant;
          }

          /**
           * @returns {Class} The subclass of {@link AdaptiveVariant} set as default variant.
           * @static
           */
          static get defaultVariant() {
            return _defaultVariantType;
          }
        };

        return AdaptiveComponent;
      });

      /**
       * Prefix for all attributes related to the adaptive web components framework.
       */
      const AWC_ATTRIBUTE_PREFIX = 'awc-';
    }
  };
});
$__System.register('4', [], function (_export, _context) {
  "use strict";

  return {
    setters: [],
    execute: function () {

      /**
       * A variant of an Adaptive Web Component.
       */
      class AdaptiveVariant {
        constructor() {
          /**
           * The {@link Node} that contains the variant's DOM contents, e.g. the shadow root.
           * @member {Node}
           * @private
           */
          this._contentRoot = null;
        }

        /**
         * @returns {DocumentFragment}
         * @readonly
         */
        get template() {
          return new DocumentFragment();
        }

        /**
         * @returns {Node} The node that contains the variant's DOM contents, e.g. the shadow root.
         */
        get contentRoot() {
          return this._contentRoot;
        }

        /**
         * Sets the node that contains the variant's DOM contents.
         * 
         * @param {Node} node The node that contains the variant's DOM contents, e.g. the shadow root.
         */
        set contentRoot(node) {
          this._contentRoot = node;
        }

        /**
         * Called when the variant has been selected as the current variant for the owning component.
         * 
         * @param {Object} state The internal state the variant should take up
         */
        selectedCallback(state) {
          console.log(`${this.constructor.name}.selectedCallback`, state);

          let prototype = Object.getPrototypeOf(this);
          for (let property in state) {
            if (!AdaptiveVariant.prototype.hasOwnProperty(property) && typeof Object.getOwnPropertyDescriptor(prototype, property).set == 'function') {
              this[property] = state[property];
            }
          }
        }

        /**
         * Called when the variant has been deselected as the current variant for the owning component.
         * 
         * @returns {Object} The internal state of the variant
         */
        deselectedCallback() {
          console.log(`${this.constructor.name}.deselectedCallback`);

          let state = {};
          let prototype = Object.getPrototypeOf(this);
          for (let property in Object.getOwnPropertyDescriptors(prototype)) {
            if (!AdaptiveVariant.prototype.hasOwnProperty(property) && typeof Object.getOwnPropertyDescriptor(prototype, property).get == 'function') {
              state[property] = this[property];
            }
          }

          return state;
        }

        /**
         * Called after the variant has been connected to the component's content root.
         */
        connectedCallback() {
          console.log(`${this.constructor.name}.connectedCallback`);

          let clone = document.importNode(this.template, true);
          this.contentRoot.appendChild(clone);
        }

        /**
         * Called after the variant's contents have been removed from the component's content root.
         */
        disconnectedCallback() {
          console.log(`${this.constructor.name}.disconnectedCallback`);
        }

        /**
         * Checks if the variant matches the given context.
         * @param {Object} profile 
         */
        static matches(profile) {
          return false;
        }
      }

      _export('default', AdaptiveVariant);
    }
  };
});
$__System.register('3', [], function (_export, _context) {
  "use strict";

  return {
    setters: [],
    execute: function () {

      /**
       * Simple volatile in-memory profile store. 
       * Mainly serves as a base class for implementations that represent different sources, storage locations 
       * or fetch methods for user interface profiles.
       * 
       * @param {Boolean} [changeable=false] - Specifies if the store supports to change the stored profile.
       * @param {EventTarget} [attachTo=window] - Specifies the node, the ProfileStore is attached to.
       */
      class ProfileStore {
        constructor(changeable = false, attachTo = window) {
          /** 
           * The current profile
           * @member {Object}
           * @protected
           */
          this._profile = {};

          /** 
           * Flag indicating if changes of the profile are supported
           * @member {Boolean}
           * @private
           */
          this._changeable = changeable;

          /**
           * Node that is used for dispatching profile changed events and listening to profile requests.
           * @member {EventTarget}
           * @private
           */
          this._attachedTo = attachTo;

          /**
             * Handler for {@link PROFILE_REQUEST_EVENT}s that is bound to this store.
             * @member {Function}
             * @private
             */
          this._profileRequestHandler = this._profileRequest.bind(this);

          // Listen for profile requests
          this._attachedTo.addEventListener(PROFILE_REQUEST_EVENT, this._profileRequestHandler);
        }

        /**
         * The current user interface profile.
         * @readonly
         * @returns {Promise} A promise to the current user interface profile.
         */
        get profile() {
          return new Promise((resolve, reject) => {
            if (this._profile) {
              resolve(Object.assign({}, this._profile));
            } else {
              reject('No profile available.');
            }
          });
        }

        /**
         * Indicates if changes of the profile are supported.
         * @readonly
         * @returns {Boolean} <code>true</code> if profile store supports to change the profile, <code>false</code> if not. 
         */
        get changeable() {
          return this._changeable;
        }

        /**
         * Allows to request a value change of profile properties. It returns the effective changes.
         * 
         * @param {Object<String, ?Any>} newValues - A map of the requested property changes. JSON structured like
         * 		<code>{ propertyName: newValue , ... }</code>.
         * 
         * @returns {Promise} A promise to the effective changes.
         */
        changeProfile(newValues) {
          if (!this._changeable) {
            return Promise.reject('Changing the profile is not supported.');
          }

          let changedValues = {};

          for (let property in newValues) {
            // Get old value
            let oldValue = undefined;
            if (property in this._profile) {
              oldValue = this._profile[property];
            }

            // Change necessary?
            let newValue = newValues[property];
            if (oldValue != newValue) {
              if (newValue !== undefined) {
                this._profile[property] = newValue;
              } else {
                Reflect.deleteProperty(this._profile, property);
              }

              changedValues[property] = { from: oldValue, to: newValue };
            }
          }

          // Only if there have been changes
          if (Object.getOwnPropertyNames(changedValues).length > 0) {
            // Dispatch change event
            this._profileChanged(changedValues);
          }

          return Promise.resolve(changedValues);
        }

        /**
         * Creates and dispatches a profile changed event containing information on changed values of profile properties.
         * 
         * @param {ProfileDiff} diff - A data structure describing the last changes to the profile properties. Expected to
         *      be structured like <code>{ propertyName: { from: oldValue, to: newValue }, ... }</code>.
         */
        _profileChanged(diff) {
          // Create profile changed event
          let changeEvent = new CustomEvent(PROFILE_CHANGED_EVENT, { detail: {
              store: this,
              current: Object.assign({}, this._profile),
              changes: diff
            } });

          // Dispatch event
          this._attachedTo.dispatchEvent(changeEvent);
        }

        /**
         * Handles profile requests by providing the current profile to the provided callback and stopping the further 
         * event propagation immediatly.
         * 
         * @param {CustomEvent} event The {@link PROFILE_REQUEST_EVENT} to handle
         * 
         * @private
         */
        _profileRequest(event) {
          console.log(`${this.constructor.name}._profileRequest: Event ${event.type} at ${event.timeStamp} on ${event.target} received at ${event.currentTarget}`);

          // Provide a copy of the current profile
          event.detail.callback(Object.assign({}, this._profile), this._attachedTo);

          // Stop further handling of this request
          event.stopImmediatePropagation();
        }
      }

      _export('default', ProfileStore);

      /**
       * The type of the {@link CustomEvent} that is triggered when a profile has been changed.
       * @type {String}
       */
      const PROFILE_CHANGED_EVENT = 'awcProfileChanged';

      /**
       * The type of {@link CustomEvent}s that represent a request to provide the current profile.
       */

      _export('PROFILE_CHANGED_EVENT', PROFILE_CHANGED_EVENT);

      const PROFILE_REQUEST_EVENT = 'awcProfileRequest';

      /**
       * A structured object describing the changes that occurred or have been made to a profile.
       * Each changed profile property is represented by its property name. The value of this property 
       * is an object with a <code>from</code> property representing the old value and a <code>to</code> 
       * property representing the new current value. If <code>from</code> is <code>null</code>, 
       * the property has just been added. Accordingly, if <code>to</code> is <code>null</code>, 
       * the property has been removed from the profile.
       * @typedef {Object.<String, ProfileChange>} ProfileDiff
       * 
       * @example
       * {
       *   changed: {from: 1, to: 5},
       *   new: {from: null, to: 'foo'},
       *   removed: {from: true, to: null}
       * }
       */

      /**
       * An object representing the value change of a profile property.
       * @typedef {Object} ProfileChange
       * @property {?Any} from the old value or <code>null</code>
       * @property {?Any} to the new value or <code>null</code>
       */

      _export('PROFILE_REQUEST_EVENT', PROFILE_REQUEST_EVENT);
    }
  };
});
$__System.register('5', ['3'], function (_export, _context) {
  "use strict";

  var ProfileStore;
  return {
    setters: [function (_) {
      ProfileStore = _.default;
    }],
    execute: function () {

      /**
       * A {@link ProfileStore} implementation based on {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage HTML5 Local Storage}.
       * 
       * @param {EventTarget} [attachTo=window] - Specifies the node, the ProfileStore is attached to.
       */
      class LocalProfileStore extends ProfileStore {
        constructor(attachTo = window) {
          super(true, attachTo);

          if (typeof window.localStorage !== 'undefined') {
            if (!window.localStorage.getItem(LOCAL_STORAGE_KEY)) {
              // Local storage is available, but not initialized, so initialize
              window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({}));
            }
            // Fill current profile variable
            this._profile = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
          }
        }

        /**
         * Allows to request a value change of profile properties. It returns a promise to
         *
         * @param {Object} newValues - A map of the requested property changes. JSON structured like
         * 		<code>{ propertyName: newValue , ... }</code>.
         */
        changeProfile(newValues) {
          let changedValues = {};

          for (let property in newValues) {
            // Get old value
            let oldValue = undefined;
            if (property in this._profile) {
              oldValue = this._profile[property];
            }

            // Change necessary?
            let newValue = newValues[property];
            if (oldValue != newValue) {
              if (newValue !== undefined) {
                this._profile[property] = newValue;
              } else {
                Reflect.deleteProperty(this._profile, property);
              }

              changedValues[property] = { from: oldValue, to: newValue };
            }
          }

          // Only if there have been changes
          if (Object.getOwnPropertyNames(changedValues).length > 0) {
            // Update local storage
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this._profile));

            // Dispatch change event
            this._profileChanged(changedValues);
          }

          return Promise.resolve(changedValues);
        }
      }

      _export('default', LocalProfileStore);

      /**
       * The storage key used for storing the profile.
       * @type {String}
       */
      const LOCAL_STORAGE_KEY = 'awcLocalProfileStore';

      _export('LOCAL_STORAGE_KEY', LOCAL_STORAGE_KEY);
    }
  };
});
$__System.register('1', ['2', '4', '3', '5'], function (_export, _context) {
  "use strict";

  var AdaptiveComponent, AdaptiveVariant, ProfileStore, LocalProfileStore;
  return {
    setters: [function (_) {
      AdaptiveComponent = _.default;
    }, function (_2) {
      AdaptiveVariant = _2.default;
    }, function (_3) {
      ProfileStore = _3.default;
    }, function (_4) {
      LocalProfileStore = _4.default;
    }],
    execute: function () {
      _export('AdaptiveComponent', AdaptiveComponent);

      _export('AdaptiveVariant', AdaptiveVariant);

      _export('ProfileStore', ProfileStore);

      _export('LocalProfileStore', LocalProfileStore);
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
    awc = factory();
});