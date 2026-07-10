let timeout: ReturnType<typeof setTimeout> | undefined;

const debounce = (func: () => void, wait = 300, immediate = false): void => {
  if (timeout) clearTimeout(timeout);

  if (immediate) {
    const callNow = !timeout;
    timeout = setTimeout(() => {
      timeout = undefined;
    }, wait);
    if (callNow) func();
    return;
  }

  timeout = setTimeout(func, wait);
};

export default debounce;
