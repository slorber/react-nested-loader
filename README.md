React Nested Loader
==========================

Manage for you the loading state of deeply nested views/buttons.<br/>This is **NOT an UI toolkit**, and it works with React and ReactNative.


![image](https://user-images.githubusercontent.com/749374/35107228-b2abbf4a-fc70-11e7-87a5-93528c8797b8.png)
![image](https://user-images.githubusercontent.com/749374/35110949-5457c7fe-fc7a-11e7-8fc9-c0e0687b01f6.png)

![image](https://user-images.githubusercontent.com/749374/35104923-9c57f12e-fc6a-11e7-86ef-aa3a11724dd4.png)
![image](https://user-images.githubusercontent.com/749374/35111647-007356b0-fc7c-11e7-89f9-1211519a1ac0.png)


**Why:** because handling a promise, maintaining a `loading` prop in state, and passing it down through a lot of intermediate components to your button requires too much boilerplate, is error-prone (ie, concurrency issues in promise handling), yet it's a very common need in many applications to display a loading indicator/spinner inside a button that triggers an async action/api call/mutation.

**How:** The button is wrapped by an HOC. The HOC will proxy all props callbacks passed to the button. Whenever a callback returns a promise, the HOC will intercept that promise and manage state for you. The button will receive `loading=true` until the promise resolves.

## Hello world:

Here is a [CodeSandbox](https://codesandbox.io/s/oo991llpqz) hello world example with the following code.

```js
import React from "react";
import { render } from "react-dom";
import ReactNestedLoader from "react-nested-loader";

const appStyle = {};
const buttonStyle = {};

let Button = ({
  onClick,
  text,
  loading // will be injected
}) => (
  <button onClick={onClick} style={buttonStyle}>
    {loading ? "..." : text}
  </button>
);

// Step1: wrap your button so that it receives the loading prop
Button = ReactNestedLoader(Button);

const App = () => (
  <div style={appStyle}>
    <Button
      text="click me"
      onClick={e => {
        const promise = fakeAPICall();
        return promise; // Step2: return a promise
      }}
    />
  </div>
);

render(<App />, document.getElementById("root"));

```

## Usage

`npm install react-nested-loader`


#### 1) Wrap your button:

```javascript
import ReactNestedLoader from "react-nested-loader";

const Button = ({onClick,loading}) => (
  <button onClick={onClick} disabled={loading}>
    {loading ? "..." : "Click me "}
  </button>
);
const LoadingButton = ReactNestedLoader(Button);
```

The `ReactNestedLoader` HOC will inject a `loading=false` prop to the wrapped component.
Whenever a function props returns a promise (ie, `onClick` callback returns a promise) the button will receive `loading=true` during promise resolution.


#### 2) Return a promise in container/smartComp/controller:


```javascript
const SomeIntermediateComp = ({onButtonClick}) => (
  <WhateverYouWant>
    <LoadingButton onClick={onButtonClick}/>
  </WhateverYouWant>
);

class Container extends React.Component {
  handleClick = () => {
    const promise = MyAPI.doSomethingAsync();
    return promise; // VERY IMPORTANT: the promise MUST be returned to the button
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
<br/>No need to use any local state, you just need to add a `return` in your callback and everything will work immmediately.


## API

```javascript
const LoadingButton = ReactNestedLoader(Button);
```

Or

```javascript
const LoadingButton = ReactNestedLoader(options)(Button);
```

### Options

```js
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

