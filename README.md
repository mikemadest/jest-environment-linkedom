# jest-environment-linkedom
## 1. What is this

This is mostly an experiment to see what I can get working, this is not usage in production or even in development actually since it's a WIP.

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
  testEnvironment: './linkedom/linkedom-environment.js',
};
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
    expect(screen.getByText('search')).toBeInTheDocument();
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
  
## 6. Status

- render and content checking pass.
- onClick test fail.

