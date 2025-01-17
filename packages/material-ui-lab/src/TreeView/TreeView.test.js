import React from 'react';
import { expect } from 'chai';
import { spy } from 'sinon';
import { createClientRender, fireEvent } from 'test/utils/createClientRender';
import describeConformance from '@material-ui/core/test-utils/describeConformance';
import { createMount, getClasses } from '@material-ui/core/test-utils';
import TreeView from './TreeView';
import TreeItem from '../TreeItem';

describe('<TreeView />', () => {
  let classes;
  let mount;
  // StrictModeViolation: test uses TreeItem
  const render = createClientRender({ strict: false });

  before(() => {
    mount = createMount({ strict: true });
    classes = getClasses(<TreeView />);
  });

  describeConformance(<TreeView />, () => ({
    classes,
    inheritComponent: 'ul',
    mount,
    refInstanceof: window.HTMLUListElement,
    skip: ['componentProp'],
    after: () => mount.cleanUp(),
  }));

  it('should not error when component state changes', () => {
    function MyComponent() {
      const [, setState] = React.useState(1);

      return (
        <TreeView>
          <TreeItem
            nodeId="one"
            label="one"
            data-testid="one"
            onFocus={() => {
              setState(Math.random);
            }}
          >
            <TreeItem nodeId="two" label="two" data-testid="two" />
          </TreeItem>
        </TreeView>
      );
    }

    const { getByText, getByTestId } = render(<MyComponent />);

    fireEvent.click(getByText('one'));
    expect(getByTestId('one')).to.have.focus;
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
    expect(getByTestId('two')).to.have.focus;
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });
    expect(getByTestId('one')).to.have.focus;
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
    expect(getByTestId('two')).to.have.focus;
  });

  describe('onNodeToggle', () => {
    it('should be called when a parent node is clicked', () => {
      const handleNodeToggle = spy();

      const { getByText } = render(
        <TreeView onNodeToggle={handleNodeToggle}>
          <TreeItem nodeId="1" label="outer">
            <TreeItem nodeId="2" label="inner" />
          </TreeItem>
        </TreeView>,
      );

      fireEvent.click(getByText('outer'));

      expect(handleNodeToggle.callCount).to.equal(1);
      expect(handleNodeToggle.args[0][0]).to.equal('1');
      expect(handleNodeToggle.args[0][1]).to.equal(true);
    });
  });

  describe('Accessibility', () => {
    it('(TreeView) should have the role `tree`', () => {
      const { getByRole } = render(<TreeView />);

      expect(getByRole('tree')).to.be.ok;
    });
  });
});
