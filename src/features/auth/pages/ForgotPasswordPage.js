import { authService } from '../services/authService.js';
import { Notification } from '../../../lib/Notification.js';

export async function ForgotPasswordPage() {
    const container = document.createElement('div');
    container.className = 'min-h-screen flex items-center justify-center relative bg-background';

    // Background blobs
    const blob1 = document.createElement('div');
    blob1.className = 'absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full animate-pulse pointer-events-none';
    container.appendChild(blob1);

    // Back to login link
    const backLink = document.createElement('a');
    backLink.href = '/login';
    backLink.className = 'fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface/80 backdrop-blur-lg border border-border text-muted hover:text-primary text-sm transition-all hover:bg-surface group';
    backLink.innerHTML = `<svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg> Voltar`;
    container.appendChild(backLink);

    const card = document.createElement('div');
    card.className = 'glass-panel p-8 md:p-12 rounded-2xl w-full max-w-md mx-4 relative z-10 animate-slide-up';

    // STATE
    let currentEmail = '';

    card.innerHTML = `
        <!-- STEP 1: EMAIL -->
        <div id="step-email">
            <h2 class="text-3xl font-bold mb-2 text-center text-primary">Recuperar Conta</h2>
            <p class="text-muted text-center mb-8">Introduz o teu e-mail para receberes um código de recuperação.</p>
            
            <form id="email-form" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-muted mb-1">E-mail</label>
                    <div class="relative group">
                        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-neon transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <input type="email" id="email" required
                            class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg pl-12 pr-4 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-colors placeholder-muted/50"
                            placeholder="nome@escola.pt">
                    </div>
                </div>
                
                <button type="submit" 
                    class="w-full bg-neon text-black font-bold py-3 rounded-lg hover:bg-white transition-all duration-300 shadow-lg shadow-neon/20 hover:shadow-white/20">
                    Enviar Código
                </button>
            </form>
            <p class="mt-8 text-center text-sm text-muted">
                 Lembrou-se da senha? <a href="/login" class="text-neon hover:underline">Entrar</a>
            </p>
        </div>

        <!-- STEP 2: OTP -->
        <div id="step-otp" class="hidden">
            <div class="text-center mb-8 animate-tg-pop">
                <div class="w-16 h-16 bg-neon/10 text-neon rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-neon/20 shadow-lg shadow-neon/10">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                </div>
                <h2 class="text-3xl font-bold mb-2 text-primary">Verificar Código</h2>
                <p class="text-muted">Enviámos um código para <br><span id="otp-email-display" class="text-neon font-bold"></span></p>
            </div>

            <div class="space-y-8">
                <div class="space-y-4">
                    <div class="relative group">
                        <input type="text" id="otp-input"
                            class="w-full bg-surface border-2 border-border focus:border-neon rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-primary focus:outline-none transition-all placeholder-muted/20"
                            placeholder="000000" maxlength="6" inputmode="numeric" autocomplete="one-time-code">
                        <p class="text-xs text-center text-muted mt-2">Código de 6 dígitos</p>
                    </div>
                </div>

                <button id="verify-btn" class="w-full bg-neon text-black font-bold py-3 rounded-lg hover:bg-white transition-all shadow-lg shadow-neon/20">
                    Verificar
                </button>
            </div>
        </div>

        <!-- STEP 3: NEW PASSWORD -->
        <div id="step-password" class="hidden">
            <h2 class="text-3xl font-bold mb-2 text-center text-primary">Nova Palavra-passe</h2>
            <p class="text-muted text-center mb-8">Define a tua nova palavra-passe.</p>
             <form id="password-form" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-muted mb-1">Nova Palavra-passe</label>
                    <div class="relative group">
                        <input type="password" id="new-password" required minlength="6"
                            class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-colors placeholder-muted/50"
                            placeholder="••••••••">
                    </div>
                </div>
                <button type="submit" 
                    class="w-full bg-neon text-black font-bold py-3 rounded-lg hover:bg-white transition-all duration-300 shadow-lg shadow-neon/20 hover:shadow-white/20">
                    Atualizar Palavra-passe
                </button>
            </form>
        </div>
    `;

    // --- ELEMENTS ---
    const stepEmail = card.querySelector('#step-email');
    const stepOtp = card.querySelector('#step-otp');
    const stepPassword = card.querySelector('#step-password');
    const emailDisplay = card.querySelector('#otp-email-display');

    // --- STEP 1: Email Submit ---
    const emailForm = card.querySelector('#email-form');
    emailForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = emailForm.querySelector('button');
        const email = emailForm.querySelector('#email').value;

        btn.disabled = true;
        btn.innerHTML = '<span class="animate-pulse">A enviar...</span>';

        const { error } = await authService.resetPassword(email);

        if (error) {
            Notification.error('Erro: ' + error.message);
            btn.disabled = false;
            btn.innerHTML = 'Enviar Código';
        } else {
            currentEmail = email;
            emailDisplay.innerText = email;

            stepEmail.classList.add('hidden');
            stepOtp.classList.remove('hidden');
            stepOtp.classList.add('animate-slide-up');

            setTimeout(() => {
                const otpField = card.querySelector('#otp-input');
                if (otpField) otpField.focus();
            }, 100);
        }
    };

    // --- STEP 2: OTP Logic (6-digit numeric code) ---
    const otpInput = card.querySelector('#otp-input');
    otpInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    const verifyBtn = card.querySelector('#verify-btn');
    verifyBtn.onclick = async () => {
        const token = otpInput.value.trim();
        if (token.length < 6) return Notification.error('Código inválido. Introduz o código completo (6-8 dígitos).');

        verifyBtn.disabled = true;
        verifyBtn.innerText = 'A verificar...';

        const { error } = await authService.verifyRecoveryOtp(currentEmail, token);

        if (error) {
            Notification.error(error.message);
            verifyBtn.disabled = false;
            verifyBtn.innerText = 'Verificar';
        } else {
            // Success: User is logged in now. Move to password reset step.
            stepOtp.classList.add('hidden');
            stepPassword.classList.remove('hidden');
            stepPassword.classList.add('animate-slide-up');
        }
    };

    // --- STEP 3: Password Update ---
    const passForm = card.querySelector('#password-form');
    passForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = passForm.querySelector('button');
        const pass = passForm.querySelector('#new-password').value;

        btn.disabled = true;
        btn.innerText = 'A atualizar...';

        const { error } = await authService.updatePassword(pass);

        if (error) {
            Notification.error(error.message);
            btn.disabled = false;
            btn.innerText = 'Atualizar Palavra-passe';
        } else {
            Notification.success('Palavra-passe atualizada! A redirecionar...');
            setTimeout(() => {
                window.history.pushState({}, '', '/dashboard');
                window.dispatchEvent(new Event('popstate'));
            }, 1000);
        }
    };

    container.appendChild(card);
    return container;
}
