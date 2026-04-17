export function typeWriter(element, text, speed = 50, delay = 0) {
    if (!element) return;
    element.textContent = '';

    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // Optional: Blinking cursor at the end
            element.innerHTML += '<span class="animate-pulse">|</span>';
        }
    }

    setTimeout(type, delay);
}
