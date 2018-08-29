import React from "react";


function mapValues(object, iteratee) {
  object = Object(object);
  const result = {};
  Object.keys(object).forEach((key) => {
    result[key] = iteratee(object[key], key, object);
  });
  return result
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}


const DefaultConfig = {
  // The "loading" prop to use for injecting the loading boolean value
  loadingProp: "loading",

  // The "error" prop to use for injecting the rejection error when this happen
  errorProp: "error",

  // The "api" prop that will be injected into your component for manual control (ie send promises to handle)
  apiProp: "reactNestedLoader",

  // You might want to log the intercepted errors?
  // Sometimes you want to only display the promise error temporarily (for example, make the button blink on error)
  // You can do so with: onError: (error, remove) => setTimeout(remove,1000)
  onError: (error, remove) => {},

  // It is safer to delay by default slightly the loader removal
  // For example if your promise has 2 then() callbacks (removal of a view and loader removal),
  // this ensures that the loader is not removed just before view removal, leading to flicker
  delay: true,

  // Should we use React.forwardRef (meaning it won't be possible to get this comp instance, just the wrapped comp)
  forwardRef: true,

  // To which prop should the ref be forwarded
  // - if wrapped component use forwardRef, then "ref" makes sense
  // - else you may want to get the instance of the wrapped component, or it probably expose an "innerRef" prop...
  refProp: 'ref',
};


function wrap(Comp,config = DefaultConfig) {

  const {
    loadingProp,
    errorProp,
    apiProp,
    onError,
    delay,
    forwardRef,
    refProp,
  } = {
    ...DefaultConfig,
    ...config,
  };

  class ReactNestedLoader extends React.Component {

    static InitialState = {
      loading: false,
      error: undefined,
    };

    constructor(props) {
      super(props);
      this.state = ReactNestedLoader.InitialState;
      this.api = {
        handlePromise: this.handlePromise,
      };
      this.proxyCache = {};
    }

    componentWillUnmount() {
      this.setState = () => {};
    }


    handlePromise = promise => {
      this.setState({loading: true, error: undefined});

      // Handle potential concurrency issues due to handling multiple promises concurrently
      this.promise = promise;
      const isCurrentPromise = () => promise === this.promise;

      const handleResolve = (error = undefined) => {

        // Handle potential concurrency issues due to handling multiple promises concurrently
        // We only want to handle the last promise
        const doHandleResolve = () => {
          if (isCurrentPromise()) {
            this.setState(
              {
                loading: false,
                error,
              },
              () => {
                if (error) {
                  const removeError = () => {
                    if (isCurrentPromise()) {
                      this.setState({
                        error: undefined,
                      });
                    }
                  };
                  onError(error, removeError)
                }
              }
            );
          }
        };

        // Handle the delaying of resolution
        if (delay) {
          if (delay instanceof Function) {
            delay(doHandleResolve);
          }
          else if (delay instanceof Number ) {
            setTimeout(doHandleResolve,delay);
          }
          else {
            setTimeout(doHandleResolve,0);
          }
        }
        else {
          doHandleResolve();
        }
      };

      promise.then(
        () => handleResolve(),
        e => handleResolve(e)
      );
    };

    buildProxy = fn => {
      return (...args) => {
        const result = fn(...args);
        if (result instanceof Promise) {
          this.handlePromise(result);
        }
        return result;
      };
    };

    // We use caching, so that if input functions are stable across renders,
    // we provide stable proxied functions to children to avoid triggering unnecessary renders to wrapped component
    maybeBuildProxy = (prop, propName) => {
      if (prop instanceof Function) {
        const cache = this.proxyCache[propName];
        if (cache && cache.originalProp === prop) {
          return cache.proxyProp;
        } else {
          const proxy = this.buildProxy(prop);
          this.proxyCache[propName] = {
            originalProp: prop,
            proxyProp: proxy,
          };
          return proxy;
        }
      } else {
        return prop;
      }
    };

    render() {
      return (
        <Comp
          {...{[loadingProp]: this.state.loading}}
          {...{[errorProp]: this.state.error}}
          {...{[apiProp]: this.api}}
          {...mapValues(this.props, this.maybeBuildProxy)}
          {...{[refProp]: this.props.innerRef}}
        />
      );
    }
  }

  ReactNestedLoader.displayName = `ReactNestedLoader(${getDisplayName(Comp)})`;

  if ( forwardRef ) {
    return React.forwardRef((props,ref) => (
      <ReactNestedLoader {...props} innerRef={ref} />
    ));
  }
  else {
    return ReactNestedLoader
  }
}

// see https://twitter.com/sebastienlorber/status/1034747209215041536
const isForwardRef = x => typeof x.$$typeof === "symbol" && !!x.render

export default compOrOptions => {
  if ( typeof compOrOptions === 'object' && !isForwardRef(compOrOptions) ) {
    return Comp => wrap(Comp,compOrOptions);
  }
  else {
    return wrap(compOrOptions);
  }
}
