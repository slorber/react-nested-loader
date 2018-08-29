"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mapValues(object, iteratee) {
  object = Object(object);
  var result = {};
  Object.keys(object).forEach(function (key) {
    result[key] = iteratee(object[key], key, object);
  });
  return result;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

var DefaultConfig = {
  // The "loading" prop to use for injecting the loading boolean value
  loadingProp: "loading",

  // The "error" prop to use for injecting the rejection error when this happen
  errorProp: "error",

  // The "api" prop that will be injected into your component for manual control (ie send promises to handle)
  apiProp: "reactNestedLoader",

  // You might want to log the intercepted errors?
  // Sometimes you want to only display the promise error temporarily (for example, make the button blink on error)
  // You can do so with: onError: (error, remove) => setTimeout(remove,1000)
  onError: function onError(error, remove) {},

  // It is safer to delay by default slightly the loader removal
  // For example if your promise has 2 then() callbacks (removal of a view and loader removal),
  // this ensures that the loader is not removed just before view removal, leading to flicker
  delay: true,

  // Should we use React.forwardRef (meaning it won't be possible to get this comp instance, just the wrapped comp)
  forwardRef: true,

  // To which prop should the ref be forwarded
  // - if wrapped component use forwardRef, then "ref" makes sense
  // - else you may want to get the instance of the wrapped component, or it probably expose an "innerRef" prop...
  refProp: 'ref'
};

function wrap(Comp) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultConfig;

  var _DefaultConfig$config = _extends({}, DefaultConfig, config),
      loadingProp = _DefaultConfig$config.loadingProp,
      errorProp = _DefaultConfig$config.errorProp,
      apiProp = _DefaultConfig$config.apiProp,
      onError = _DefaultConfig$config.onError,
      delay = _DefaultConfig$config.delay,
      forwardRef = _DefaultConfig$config.forwardRef,
      refProp = _DefaultConfig$config.refProp;

  var ReactNestedLoader = function (_React$Component) {
    _inherits(ReactNestedLoader, _React$Component);

    function ReactNestedLoader(props) {
      _classCallCheck(this, ReactNestedLoader);

      var _this = _possibleConstructorReturn(this, (ReactNestedLoader.__proto__ || Object.getPrototypeOf(ReactNestedLoader)).call(this, props));

      _this.handlePromise = function (promise) {
        _this.setState({ loading: true, error: undefined });

        // Handle potential concurrency issues due to handling multiple promises concurrently
        _this.promise = promise;
        var isCurrentPromise = function isCurrentPromise() {
          return promise === _this.promise;
        };

        var handleResolve = function handleResolve() {
          var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;


          // Handle potential concurrency issues due to handling multiple promises concurrently
          // We only want to handle the last promise
          var doHandleResolve = function doHandleResolve() {
            if (isCurrentPromise()) {
              _this.setState({
                loading: false,
                error: error
              }, function () {
                if (error) {
                  var removeError = function removeError() {
                    if (isCurrentPromise()) {
                      _this.setState({
                        error: undefined
                      });
                    }
                  };
                  onError(error, removeError);
                }
              });
            }
          };

          // Handle the delaying of resolution
          if (delay) {
            if (delay instanceof Function) {
              delay(doHandleResolve);
            } else if (delay instanceof Number) {
              setTimeout(doHandleResolve, delay);
            } else {
              setTimeout(doHandleResolve, 0);
            }
          } else {
            doHandleResolve();
          }
        };

        promise.then(function () {
          return handleResolve();
        }, function (e) {
          return handleResolve(e);
        });
      };

      _this.buildProxy = function (fn) {
        return function () {
          var result = fn.apply(undefined, arguments);
          if (result instanceof Promise) {
            _this.handlePromise(result);
          }
          return result;
        };
      };

      _this.maybeBuildProxy = function (prop, propName) {
        if (prop instanceof Function) {
          var cache = _this.proxyCache[propName];
          if (cache && cache.originalProp === prop) {
            return cache.proxyProp;
          } else {
            var proxy = _this.buildProxy(prop);
            _this.proxyCache[propName] = {
              originalProp: prop,
              proxyProp: proxy
            };
            return proxy;
          }
        } else {
          return prop;
        }
      };

      _this.state = ReactNestedLoader.InitialState;
      _this.api = {
        handlePromise: _this.handlePromise
      };
      _this.proxyCache = {};
      return _this;
    }

    _createClass(ReactNestedLoader, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.setState = function () {};
      }

      // We use caching, so that if input functions are stable across renders,
      // we provide stable proxied functions to children to avoid triggering unnecessary renders to wrapped component

    }, {
      key: "render",
      value: function render() {
        return _react2.default.createElement(Comp, _extends({}, _defineProperty({}, loadingProp, this.state.loading), _defineProperty({}, errorProp, this.state.error), _defineProperty({}, apiProp, this.api), mapValues(this.props, this.maybeBuildProxy), _defineProperty({}, refProp, this.props.innerRef)));
      }
    }]);

    return ReactNestedLoader;
  }(_react2.default.Component);

  ReactNestedLoader.InitialState = {
    loading: false,
    error: undefined
  };


  ReactNestedLoader.displayName = "ReactNestedLoader(" + getDisplayName(Comp) + ")";

  if (forwardRef) {
    return _react2.default.forwardRef(function (props, ref) {
      return _react2.default.createElement(ReactNestedLoader, _extends({}, props, { innerRef: ref }));
    });
  } else {
    return ReactNestedLoader;
  }
}

// see https://twitter.com/sebastienlorber/status/1034747209215041536
var isForwardRef = function isForwardRef(x) {
  return _typeof(x.$$typeof) === "symbol" && !!x.render;
};

exports.default = function (compOrOptions) {
  if ((typeof compOrOptions === "undefined" ? "undefined" : _typeof(compOrOptions)) === 'object' && !isForwardRef(compOrOptions)) {
    return function (Comp) {
      return wrap(Comp, compOrOptions);
    };
  } else {
    return wrap(compOrOptions);
  }
};
