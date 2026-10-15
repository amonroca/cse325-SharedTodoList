// Keyboard support for modal dialogs: keeps Tab focus inside the dialog
// and returns focus to whatever opened it when the dialog closes.
const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function open(dialog) {
  // Tracked in App.razor, because a child component may already have moved focus into the dialog.
  const previouslyFocused = window.lastFocusOutsideDialog ?? document.activeElement;

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll(focusableSelector)];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  dialog.addEventListener('keydown', onKeyDown);

  // Move focus into the dialog unless a child component already did.
  requestAnimationFrame(() => {
    if (!dialog.contains(document.activeElement)) {
      (dialog.querySelector(focusableSelector) ?? dialog).focus();
    }
  });

  return {
    close() {
      dialog.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    },
  };
}
