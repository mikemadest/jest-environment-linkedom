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
