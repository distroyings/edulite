/**
 * Creates a debounced version of a function.
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds  
 * @returns {Function} Debounced function with .cancel() method
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    const debounced = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

/**
 * Creates a throttled version of a function (max once per interval).
 * @param {Function} fn - The function to throttle
 * @param {number} interval - Interval in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, interval = 200) {
    let last = 0;
    let timer = null;
    return (...args) => {
        const now = Date.now();
        const remaining = interval - (now - last);
        clearTimeout(timer);
        if (remaining <= 0) {
            last = now;
            fn(...args);
        } else {
            timer = setTimeout(() => { last = Date.now(); fn(...args); }, remaining);
        }
    };
}
