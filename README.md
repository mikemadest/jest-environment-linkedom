# jest-environment-linkedom

## 1. What is this

This will help run Jest tests in the linkedom environment, based on https://jestjs.io/docs/next/configuration#testenvironment-string.
Example of a working basic project: https://github.com/mikemadest/example-linkedom.
This is an experiment to see what I can get working, WIP.

## 2. Why the hell

After taking an interest in Linkedom (https://github.com/WebReflection/linkedom) I came upon [this discussion](https://github.com/WebReflection/linkedom/issues/50) and used [Stephen Harberman](https://github.com/stephenh) code as starting point ([this code](https://gist.github.com/stephenh/056a500708243e2ea43246c28d19d3ae)).

The goal was just to make basic tests pass.

## 3. I wanna play too

### 3.1 Add those dependencies to your package.json:

```javascript
    "linkedom": "^0.11.0",
    "jest-fake-timers": "^1.0.2",
    "jest-mock": "^27.0.6",
    "jest-util": "^27.0.6",
```


### 3.2 After copying the files in a `linkedom` folder, update `jest.config.js` to whatever your path is to this file:
```javascript
module.exports = {
  // ... you other configs ...
  testEnvironment: './linkedom/jest-environment-linkedom.js',
};
```

You can also update your package.json like:
```javascript
  "scripts": {
    "test": "react-scripts test  --env=./jest-config/jest-environment-linkedom.js --watchAll=false",
  },
```

## 4. Basic test example (jest + react testing library):

```javascript
import React from 'react';
import {
  cleanup,
  screen,
  render,
  fireEvent,
} from '@testing-library/react/pure';

describe('Basic test', () => {
  const mockedHandleClick = jest.fn().mockImplementation(() => {
    console.log('test click');
  });

  beforeAll(() => {
    render(
      <div>
        <p>test</p>
        <p className="searchNode">search</p>
        <button type="button" onClick={mockedHandleClick}>
          click me!
        </button>
      </div>,
    );
  });

  afterAll(cleanup);

  it('should render and find content', () => {
    expect(screen.getByText(/search/i)).toBeInTheDocument();
    expect(screen.queryByText('blah')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'click me!' }),
    ).toBeInTheDocument();
  });

  it('should click the button', () => {
    fireEvent.click(screen.getByRole('button', { name: 'click me!' }));
    expect(mockedHandleClick).toHaveBeenCalled();
  });
});
```

## 5. What was done

- Added window.location to avoid crash
- Axe test require `NamedNodeMap` which was undefined. Very crude "fix" just to avoid the crash (JSDOM as a full implementation but for now I'm skipping that)
- testing library `toBeInTheDocument` (and probably other methods) uses `getRootNode` which was undefined, added a "polyfill"
- Missing `getComputedStyle`, reported here too: https://githubmemory.com/repo/WebReflection/linkedom/issues/53
  So I added a "polyfill" which mostly avoid errors for now

- extends jest-env-node to avoid reinventing the wheel and avoid setting global.RegExp as this is breaks instanceof.

**More on that last one:**

Problem is that Object in VM context are different distinct objects.
References for that issue:
https://github.com/jsdom/jsdom/compare/7.0.1...7.0.2 where jsdom avoided adding Date and RegExp to "this" for the same reason.

Jest globals differ from Node globals:
https://github.com/facebook/jest/issues/2549

vm instanceof operator don't work as expected:
https://github.com/nodejs/node-v0.x-archive/issues/1277

## 6. Status

- render and content checking pass.
- RegExp are now working
- onClick test fail: work in progress for a pull request to implement event bubbling in linkedom
