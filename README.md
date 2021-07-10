# jest-environment-linkedom

*This is mostly an experiment to see what I can get working*

After taking an interest in Linkedom
https://github.com/WebReflection/linkedom

I came upon this discussion:
https://github.com/WebReflection/linkedom/issues/50

And using this as a base:
https://gist.github.com/stephenh/056a500708243e2ea43246c28d19d3ae

I tried to come up with some that would make my basic test pass and this is the result.

After copying the files in a `linkedom` folder, update `jest.config.js` to:
```javascript
module.exports = {
  // ... you other configs ...
  testEnvironment: '../../../config/jest/linkedom/linkedom-environment.js',
};
```
More info about testEnvironment: https://jestjs.io/docs/configuration#testenvironment-string


Basic test example (jest + react testing library):

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

Addition:
- the absence of window.location was causing a crash
- Axe test require `NamedNodeMap` which was undefined. Very crude "fix" just to avoid the crash (JSDOM as a full implementation but for now I'm skipping that)
- testing library `toBeInTheDocument` (and probably other methods) uses `getRootNode` which was undefined, added a polyfill
- Missing `getComputedStyle`, reported here too: https://githubmemory.com/repo/WebReflection/linkedom/issues/53
  So I added a "polyfill" which mostly avoid errors for now
  
  
State: 
- render and content checking pass.
- onClick test fail.
