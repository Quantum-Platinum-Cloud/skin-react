import * as React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react';
import {Dialog, DialogDefaultProps, DialogOpen, HeaderFooterDialog, HeaderFooterDialogDefaultProps} from './mocks';

let component;

describe('given a closed dialog', () => {
  const input = DialogDefaultProps;
  let sibling;

  beforeEach(async () => {
    sibling = document.body.appendChild(document.createElement('div'));
    component = await render(<Dialog />);
  });

  afterEach(() => {
    document.body.removeChild(sibling);
  });

  it('then it is hidden in the DOM', async () => {
    await waitFor(() => expect(component.getByRole('dialog', {hidden: true})).toHaveAttribute('hidden'));
  });

  it('then <body> is scrollable', () => {
    expect(document.body).not.toHaveAttribute('style');
  });

  it("then it's siblings are visible", () => {
    expect(sibling).not.toHaveAttribute('aria-hidden');
  });

  it('then it does not trap focus', () => {
    expect(component.getByRole('dialog', {hidden: true}).children[0]).not.toHaveClass('keyboard-trap--active');
  });

  describe('when it is rerendered to be open', () => {
    beforeEach(async () => {
      await component.rerender(<Dialog open />);
    });

    thenItIsOpen(true);
  });

  function thenItIsOpen(wasToggled = false) {
    it('then it is visible in the DOM', async () => {
      await waitFor(() => expect(component.getByRole('dialog')).not.toHaveAttribute('hidden'));
    });

    it('then <body> is not scrollable', () => {
      expect(document.body).toHaveStyle('overflow:hidden');
    });

    it("then it's siblings are hidden", async () => {
      await waitFor(() => expect(sibling).toHaveAttribute('aria-hidden', 'true'));
    });

    if (wasToggled) {
      it('then it traps focus', async () => {
        await waitFor(() => {
          expect(component.getByRole('dialog').children[1]).toHaveClass('keyboard-trap--active');
          component
            .getByLabelText(input.a11yCloseText)
            .classList.forEach((cls) => expect(document.activeElement).toHaveClass(cls));
        });
      });

      it('then it emits the open event', async () => {
        await waitFor(() => expect(component.emitted('open')).toHaveLength(1));
      });

      describe('when it is rerendered with the same input', () => {
        beforeEach(async () => await component.rerender());
        thenItIsOpen();
      });
    }
  }
});

describe('given an open dialog', () => {
  const input = {...DialogDefaultProps, open: true};
  let sibling;

  beforeEach(async () => {
    sibling = document.body.appendChild(document.createElement('button'));
    sibling.focus();
    component = await render(<DialogOpen />);
  });

  afterEach(() => {
    document.body.removeChild(sibling);
  });

  thenItIsOpen();

  describe('when the close button is clicked', () => {
    beforeEach(async () => {
      await fireEvent.click(component.getByLabelText(input.a11yCloseText));
    });

    thenItIsClosed(true);
  });

  describe('when the escape is pressed', () => {
    beforeEach(async () => {
      fireEvent.keyDown(component.getByText(input.children), {key: 'Escape', code: 27});
    });

    thenItIsClosed(true);
  });

  describe('when the escape is outside modal', () => {
    beforeEach(async () => {
      fireEvent.keyDown(document, {key: 'Escape', code: 27});
    });

    thenItIsClosed(true);
  });

  describe('when the escape is pressed on input', () => {
    beforeEach(async () => {
      const inputEl = document.createElement('input');
      inputEl.setAttribute('placeholder', 'sample input');
      component.getByRole('dialog').appendChild(inputEl);
      fireEvent.keyDown(component.getByPlaceholderText('sample input'), {key: 'Escape', code: 27});
    });

    thenItIsClosed(true);
  });

  describe('when the mask is clicked', () => {
    beforeEach(async () => {
      // simulate clicking outside the dialog.
      await fireEvent.click(component.getByRole('dialog'));
    });

    thenItIsClosed(true);
  });

  function thenItIsOpen() {
    it('then it is visible in the DOM', async () => {
      await waitFor(() => expect(component.getByRole('dialog')).not.toHaveAttribute('hidden'));
    });

    it('then <body> is not scrollable', () => {
      expect(document.body).toHaveStyle('overflow:hidden');
    });

    it("then it's siblings are hidden", async () => {
      await waitFor(() => expect(sibling).toHaveAttribute('aria-hidden', 'true'));
    });

    it('then it traps focus', async () => {
      await waitFor(() => {
        expect(component.getByRole('dialog').children[1]).toHaveClass('keyboard-trap--active');
        component
          .getByLabelText(input.a11yCloseText)
          .classList.forEach((cls) => expect(document.activeElement).toHaveClass(cls));
      });
    });
  }

  function thenItIsClosed(wasToggled) {
    it('then it is hidden in the DOM', async () => {
      await waitFor(() => expect(component.getByRole('dialog', {hidden: true})).toHaveAttribute('hidden'));
    });

    it('then <body> is scrollable', async () => {
      await waitFor(() => {
        expect(document.body).not.toHaveAttribute('style');
      });
    });

    it("then it's siblings are visible", () => {
      expect(sibling).not.toHaveAttribute('aria-hidden');
    });

    it('then it restores the previous focus', async () => {
      expect(component.getByRole('dialog', {hidden: true}).children[0]).not.toHaveClass('keyboard-trap--active');
      await waitFor(() => expect(document.activeElement).toEqual(sibling));
    });

    if (wasToggled) {
      it('then it emits the close event', async () => {
        await waitFor(() => expect(component.emitted('close')).toHaveLength(1));
      });

      describe('when it is rerendered with the same input', () => {
        beforeEach(async () => await component.rerender(input));
        thenItIsOpen();
      });
    }
  }
});

describe('given an open dialog with no trap', () => {
  const input = {...DialogDefaultProps, open: true, isModal: false};
  let sibling;

  beforeEach(async () => {
    sibling = document.body.appendChild(document.createElement('button'));
    sibling.focus();
    component = await render(<DialogOpen {...input} />);
  });

  afterEach(() => {
    document.body.removeChild(sibling);
  });

  it('then it is visible in the DOM', async () => {
    await waitFor(() => expect(component.getByRole('dialog')).not.toHaveAttribute('hidden'));
  });

  it('then <body> is scrollable', () => {
    expect(document.body).not.toHaveAttribute('style');
  });

  it("then it's siblings are not hidden", () => {
    expect(sibling).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('then it does not traps focus', async () => {
    await waitFor(() => {
      expect(component.getByRole('dialog', {hidden: true}).children[1]).toEqual(undefined);
      component
        .getByLabelText(input.a11yCloseText)
        .classList.forEach((cls) => expect(document.activeElement).not.toHaveClass(cls));
    });
  });
});

describe('given an open with no close button', () => {
  const input = {...DialogDefaultProps, open: true, buttonPosition: 'hidden', skipEscape: true};
  let sibling;

  beforeEach(async () => {
    sibling = document.body.appendChild(document.createElement('button'));
    sibling.focus();
    component = await render(<DialogOpen {...input} />);
  });

  afterEach(() => {
    document.body.removeChild(sibling);
  });

  thenItIsOpen();

  describe('when the escape is pressed', () => {
    beforeEach(async () => {
      fireEvent.keyDown(component.getByText(input.children), {key: 'Escape', code: 27});
    });

    thenItIsOpen();
  });

  describe('when the escape is outside modal', () => {
    beforeEach(async () => {
      fireEvent.keyDown(document, {key: 'Escape', code: 27});
    });

    thenItIsOpen(true);
  });

  describe('when the mask is clicked', () => {
    beforeEach(async () => {
      // simulate clicking outside the dialog.
      await fireEvent.click(component.getByRole('dialog'));
    });

    thenItIsOpen(true);
  });

  function thenItIsOpen(toggle = false) {
    it('then it is visible in the DOM', async () => {
      await waitFor(() => expect(component.getByRole('dialog')).not.toHaveAttribute('hidden'));
    });

    it('then <body> is not scrollable', () => {
      expect(document.body).toHaveStyle('overflow:hidden');
    });
  }
});

describe('given a closed dialog with useHiddenProperty', () => {
  const input = {...DialogDefaultProps, useHiddenProperty: true};
  let sibling;

  beforeEach(async () => {
    sibling = document.body.appendChild(document.createElement('div'));
    component = await render(<Dialog />);
  });

  afterEach(() => {
    document.body.removeChild(sibling);
  });

  it('then it is hidden in the DOM', async () => {
    await waitFor(() => expect(component.getByRole('dialog', {hidden: true})).toHaveAttribute('hidden'));
  });

  it('then <body> is scrollable', () => {
    expect(document.body).not.toHaveAttribute('style');
  });

  it("then it's siblings are visible", async () => {
    await waitFor(() => expect(sibling).not.toHaveAttribute('hidden'));
  });

  it('then it does not trap focus', () => {
    expect(component.getByRole('dialog', {hidden: true}).children[0]).not.toHaveClass('keyboard-trap--active');
  });

  describe('when it is rerendered to be open', () => {
    beforeEach(async () => {
      await component.rerender(<DialogOpen {...input} />);
    });

    thenItIsOpen(true);
  });

  function thenItIsOpen(wasToggled = false) {
    it('then it is visible in the DOM', async () => {
      await waitFor(() => expect(component.getByRole('dialog')).not.toHaveAttribute('hidden'));
    });

    it('then <body> is not scrollable', () => {
      expect(document.body).toHaveStyle('overflow:hidden');
    });

    it("then it's siblings are hidden", async () => {
      await waitFor(() => expect(sibling).toHaveAttribute('hidden'));
    });

    if (wasToggled) {
      it('then it traps focus', async () => {
        await waitFor(() => {
          expect(component.getByRole('dialog').children[1]).toHaveClass('keyboard-trap--active');
          component
            .getByLabelText(input.a11yCloseText)
            .classList.forEach((cls) => expect(document.activeElement).toHaveClass(cls));
        });
      });

      it('then it emits the show event', async () => {
        await waitFor(() => expect(component.emitted('open')).toHaveLength(1));
      });

      describe('when it is rerendered with the same input', () => {
        beforeEach(async () => await component.rerender());
        thenItIsOpen();
      });
    }
  }
});
