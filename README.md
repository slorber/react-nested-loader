React Nested Loader
==========================


This lib provides a very easy way to inject a loader into deeply nested components.
For exemple, it removes most boilerplate code you need to inject a loader into a button.

![image](https://user-images.githubusercontent.com/749374/35107228-b2abbf4a-fc70-11e7-87a5-93528c8797b8.png)
![image](https://user-images.githubusercontent.com/749374/35104923-9c57f12e-fc6a-11e7-86ef-aa3a11724dd4.png)


## Usage

```javascript
import ReactNestedLoader from "react-nested-loader";
```

The ReactNestedLoader HOC will inject a `loading=false` prop to the wrapped component.
Whenever a function props returns a promise (ie, `onClick` callback returns a promise) the button will receive `loading=true` during promise resolution.

```javascript
const Button = ({onClick,loading}) => (
  <button onClick={onClick} disabled={loading}>
    {loading ? "..." : "Click me "}
  </button>
);
const LoadingButton = ReactNestedLoader(Button);
```



Using the `LoadingButton` into a top-level component: no need to use any local state, you just need to add a `return` and it works out of the box.

```javascript
const SomeIntermediateComp = ({onButtonClick}) => (
  <WhateverYouWant>
    <LoadingButton onClick={onButtonClick}/>
  </WhateverYouWant>
);

class Container extends React.Component {
  handleClick = () => {
    const promise = MyAPI.doSomethingAsync();
    // VERY IMPORTANT: the promise MUST be returned to the button
    // the only boilerplate you need is return
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


## Features

- Works with React and React-Native
- The callback proxies are cached appropriately so that the button does not render unnecessarily
- Will only handle the loading state of the last returned promise, to avoid concurrency issues
- Imperative API (`componentRef.api.handlePromise(promise)`)
- API injected as prop into button (`props.reactNestedLoader.handlePromise(promise))`

## Limits

The HOC does hold the button loading state as React component state. This means it won't be in your state management system (Redux/Apollo/Mobx...) and as any local state you will loose ability to use devtools to replay that state (or other fancy features). In my opinion it is not critical state that is worth putting in your Redux store anyway. I assume perfectly using this lib as well as Redux/Redux-saga/Apollo mutations.

Currently the lib only support injecting a single `loading` prop. As a component may receive multiple callbacks, we could inject multiple loading props. Please open issues with your specific usecase if needed.

