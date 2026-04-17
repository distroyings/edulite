export class CustomCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.id = 'custom-cursor';
        this.cursorStyles = `
            #custom-cursor {
                position: fixed;
                top: 0;
                left: 0;
                width: 20px;
                height: 20px;
                border: 1px solid var(--color-neon);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: transform 0.1s ease, width 0.3s, height 0.3s, background-color 0.3s;
                mix-blend-mode: difference;
                box-shadow: 0 0 10px var(--color-neon);
            }
            #custom-cursor.hovered {
                width: 50px;
                height: 50px;
                background-color: rgba(var(--color-neon-rgb), 0.1);
                border-color: transparent;
            }
            body {
                cursor: none;
            }
            a, button, .clickable {
                cursor: none; 
            }
        `;
        this.init();
    }

    init() {
        // Inject styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.cursorStyles;
        document.head.appendChild(styleSheet);
        document.body.appendChild(this.cursor);

        // Track movement
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = `${e.clientX}px`;
            this.cursor.style.top = `${e.clientY}px`;
        });

        // Hover effects
        const interactiveElements = document.querySelectorAll('a, button, input, .clickable');

        // Use Delegation for better performance and dynamic elements
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('a, button, input, select, textarea, .clickable, [onclick]')) {
                this.cursor.classList.add('hovered');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('a, button, input, select, textarea, .clickable, [onclick]')) {
                this.cursor.classList.remove('hovered');
            }
        });
    }
}
