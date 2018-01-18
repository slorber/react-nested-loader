React Nested Loader
==========================

This lib provides a very easy way to inject a loader into deeply nested component.

This is quite common to show a spinner inside a button. 

![image](https://user-images.githubusercontent.com/749374/35104923-9c57f12e-fc6a-11e7-86ef-aa3a11724dd4.png)

Not particularly hard to achieve, this clearly requires some boilerplate. This library aims to remove that boilerplate.

## Usage


```javascript
import React from "react";
import ReactNestedLoader from "react-nested-loader";
import MyAPI from "./MyAPI";


const MyButton = ({
                    onClick,
                    loading, // Injected by ReactNestedLoader
                  }) => (
  <button onClick={onClick} disabled={loading}>
    {loading ? "..." : "Click me "}
  </button>
);


// This will inject a "loading" prop which is false by default.
// Whenever a function props (ie, onClick callback) returns a promise
// the button will receive "loading=true" during promise resolution
const MyLoadingButton = ReactNestedLoader(MyButton);


// Just some intermediate component. There can be many intermediate components
const SomeIntermediateComp = ({onButtonClick}) => (
  <WhateverYouWant>
    <MyLoadingButton onClick={onButtonClick}/>
  </WhateverYouWant>
);


class Container extends React.Component {
  handleClick = () => {
    const promise = MyAPI.doSomethingAsync();
    // VERY IMPORTANT: the promise MUST returned to the button otherwise nothing will happen
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
