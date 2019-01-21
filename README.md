React Nested Loader
==========================

- Manage loading/error state of nested views/buttons triggering async actions
- Not an UI lib, you provide the UI. Works with ReactNative.
- *No boilerplate at all*, no need to use setState/Redux

## Main usecase: button triggering api calls 

You have a submit button on your form. For good UX you may want to:
- show temporarily a spinner into the button
- disable the button during the async operation
- make the button blink on api errors

Unfortunately, you are using Redux/setState/whatever, and implementing this kind of UX detail takes too much time/pollutes state/creates boilerplate so it is left for later while it doesn't have to.

![image](https://user-images.githubusercontent.com/749374/35107228-b2abbf4a-fc70-11e7-87a5-93528c8797b8.png)
![image](https://user-images.githubusercontent.com/749374/35110949-5457c7fe-fc7a-11e7-8fc9-c0e0687b01f6.png)
![image](https://user-images.githubusercontent.com/749374/35104923-9c57f12e-fc6a-11e7-86ef-aa3a11724dd4.png)
![image](https://user-images.githubusercontent.com/749374/35111647-007356b0-fc7c-11e7-89f9-1211519a1ac0.png)


## Demo

Here is a [CodeSandbox](https://codesandbox.io/s/w640yv5p9w) demo

## Usage

`npm install react-nested-loader`

#### 1) Create a button:

```javascript

const Button = ({
  onClick, 
  loading,
  error,
}) => (
  <button onClick={onClick} disabled={loading}>
    {error ? "Error" : loading ? "..." : "Click me "}
  </button>
);
```

The button UI should be able to display appropriately loading/error states. You define the styling entirely.

#### 2) Wrap your button:

```javascript
import ReactNestedLoader from "react-nested-loader";

const LoadingButton = ReactNestedLoader({
  // optional but convenient: only inject the error for 1sec for blinking effect
  onError: (error, remove) => setTimeout(remove,1000), 
})(Button);
```

The `ReactNestedLoader` HOC will by default inject a `loading=false` and `error=undefined` prop to the wrapped component.

#### 3) Return a promise in container/smartComp/controller:


```javascript
const SomeIntermediateComp = ({onButtonClick}) => (
  <WhateverYouWant>
    <LoadingButton onClick={onButtonClick}/>
  </WhateverYouWant>
);

class Container extends React.Component {
  handleClick = () => {
    const promise = MyAPI.doSomethingAsync();
    // VERY IMPORTANT: the promise MUST be returned to the button (or you can use "async handleClick")
    return promise;
  };
  render() {
    return (
      <WhateverYouWant>
        <SomeIntermediateComp onButtonClick={this.handleClick}/>
      </WhateverYouWant>
    )
  }
}
```

Using the `LoadingButton` into a top-level component.

No need to use any local state, you just need to return the promise to the button, and the `loading` / `error` prop of your button will be automatically updated according to the state of the last intercepted promise.


## API

```javascript
const LoadingButton = ReactNestedLoader(Button);
```

Or

```javascript
const LoadingButton = ReactNestedLoader(config)(Button);
```

### Options

```js
const DefaultConfig = {
  // The "loading" prop to use for injecting the loading boolean value
  loadingProp: "loading",

  // The "error" prop to use for injecting the rejection error on failed async operation
  errorProp: "error",

  // The "success" prop to use for injecting the success boolean on successful async operation
  successProp: false,

  // The "api" prop that will be injected into your component for manual control
  apiProp: false,


  // You might want to log the intercepted errors?
  // Sometimes you want to only display the promise error temporarily (for example, make the button blink on error)
  // You can do so with: onError: (error, remove, isCurrentPromise) => setTimeout(remove,1000)
  onError: (error, remove, isCurrentPromise) => {},

  // You can also inject a success boolean prop, and schedule its removal to give user feedback (like congratulations)
  onSuccess: (result, remove, isCurrentPromise) => {},

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
```

## Features

- Works with React and React-Native
- The callback proxies are cached appropriately so that the underlying button does not render unnecessarily. If you provide stable callbacks, the HOC will pass-down stable proxies and your pure component button can bypass rendering
- Will only handle the loading state of the last returned promise, to avoid concurrency issues (think `takeLatest` of Redux-saga`)
- API injected as prop into button (`props.reactNestedLoader.handlePromise(promise))`
- Can use React.forwardRef() (2.*)
- Imperative API, when not forwarding ref (`componentRef.api.handlePromise(promise)`)



## Limits

The HOC does hold the button loading state as React component state. This means it won't be in your state management system (Redux/Apollo/Mobx...) and as any local state you will loose ability to use devtools to replay that state (or other fancy features). In my opinion it is not critical state that is worth putting in your Redux store anyway. I assume perfectly using this lib as well as Redux/Redux-saga/Apollo mutations.

Currently the lib only support injecting a single `loading` prop. As a component may receive multiple callbacks, we could inject multiple loading props. Please open issues with your specific usecase if needed.


## Advices

- Wrap generic app button with `ReactNestedLoader` and manage the `loading` prop inside it to show some alternative content like a spinner
- When button component change from `loading=false` to `loading=true`, make sure the component dimension is not affected for better UX
- A nice UX is to make the text disappear and make the spinner appear, as it does not mess-up with button dimensions (make sure to use a small-enough spinner)
- If needed, pass spinner size in button props

## TODOS

- Find more explicit name?
- Support more advanced usecases?
- Tests

# Hire a freelance expert

Looking for a React/ReactNative freelance expert with more than 5 years production experience?
Contact me from my [website](https://sebastienlorber.com/) or with [Twitter](https://twitter.com/sebastienlorber).
