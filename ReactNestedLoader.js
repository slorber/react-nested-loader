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



function wrap(Comp) {

  class ReactNestedLoader extends React.Component {
    state = {
      loading: false,
    };

    componentWillMount() {
      // This is the component API that will be injected into wrapped component
      // And can also be used imperatively by using ref
      this.api = {
        handlePromise: this.handlePromise,
      }
    };

    componentWillUnmount() {
      this.unmounted = true;
    }

    proxyCache = {};

    setLoading = () => this.setState({loading: true});

    setNotLoading = () => this.setState({loading: false});

    handlePromise = promise => {
      this.promise = promise;
      this.setLoading();
      const handlePromiseResolve = () => {
        if (this.unmounted) {
          return;
        }
        if (this.promise === promise) {
          this.setNotLoading();
        }
      };
      promise.then(handlePromiseResolve, handlePromiseResolve);
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
          loading={this.state.loading}
          reactNestedLoader={this.api}
          {...mapValues(this.props, this.maybeBuildProxy)}
        />
      );
    }
  }

  ReactNestedLoader.displayName = `ReactNestedLoader(${getDisplayName(Comp)})`;

  return ReactNestedLoader;
}


export default Comp => wrap(Comp);
