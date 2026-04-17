import { authService } from '../services/authService.js';
import { profileService } from '../../../services/profileService.js';
import { Notification } from '../../../lib/Notification.js';
import { t } from '../../../lib/i18n.js';

export async function SignupPage() {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-20';

  // Background blobs
  const blob = document.createElement('div');
  blob.className = 'absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon/10 blur-[100px] rounded-full animate-pulse pointer-events-none';
  container.appendChild(blob);

  const backLink = document.createElement('a');
  backLink.href = '/';
  backLink.className = 'fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface/80 backdrop-blur-lg border border-border text-muted hover:text-primary text-sm transition-all hover:bg-surface group';
  backLink.innerHTML = `<svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg> EduLite`;
  container.appendChild(backLink);

  const card = document.createElement('div');
  card.className = 'glass-panel p-8 md:p-12 rounded-2xl w-full max-w-md mx-4 relative z-10 animate-slide-up';

  // --- STATE ---
  let currentEmail = '';

  // --- HTML STRUCTURE ---
  card.innerHTML = `
    <!-- STEP 1: SIGNUP FORM -->
    <div id="step-signup">
        <h2 class="text-3xl font-bold mb-2 text-center text-primary">${t('auth.createAccount')}</h2>
        <p class="text-muted text-center mb-8">${t('auth.joinFuture')}</p>
        
        <form id="signup-form" class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-muted mb-1">${t('auth.fullName')}</label>
            <input type="text" id="name" required maxlength="50"
            class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all placeholder-muted/50"
            placeholder="João Silva">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-muted mb-1">${t('auth.username')} (Opcional)</label>
            <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 group/tooltip cursor-help z-20">
                    <span class="text-neon font-bold text-lg">@</span>
                    <div class="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-900 border border-white/10 text-white text-xs rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 shadow-xl pointer-events-none text-left z-50">
                        Funciona como no Instagram. É o nome único que os outros utilizadores usarão para te encontrar.
                        <div class="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-white/10"></div>
                    </div>
                </div>
                <input type="text" id="username" maxlength="20"
                class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg px-10 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all placeholder-muted/50"
                placeholder="utilizador">
                <div id="username-status" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold transition-all"></div>
            </div>
            <p class="text-[10px] text-muted mt-1 px-1">Se deixares vazio, geramos um para ti automaticamente.</p>
        </div>

        <div>
            <label class="block text-sm font-medium text-muted mb-1">${t('auth.email')}</label>
            <input type="email" id="email" required maxlength="100"
            class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all placeholder-muted/50"
            placeholder="exemplo@escola.pt">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-muted mb-1">${t('auth.password')}</label>
            <div class="relative group">
                <input type="password" id="password" required minlength="6" maxlength="72"
                class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all placeholder-muted/50"
                placeholder="••••••••">
                <button type="button" id="toggle-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-neon transition-all p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                    <svg id="eye-icon" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path class="eye-open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path class="eye-open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path class="eye-closed hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.573 4.574m4.242 4.242L2.25 2.25" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="pt-2">
            <button type="submit" 
            class="w-full bg-neon text-black font-bold py-3 rounded-lg hover:bg-white transition-all duration-300 shadow-lg shadow-neon/20 hover:shadow-white/20">
            ${t('auth.createAccount')}
            </button>
        </div>

        <div class="relative py-4">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
            <div class="relative flex justify-center text-sm"><span class="px-2 bg-background text-muted">${t('auth.orContinue')}</span></div>
        </div>

        <button type="button" id="google-signup"
            class="w-full glass-input text-primary font-semibold py-3 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.536-6.033-5.696s2.7-5.696 6.033-5.696c1.482 0 2.846 0.499 3.921 1.488l2.853-2.627c-1.841-1.529-4.275-2.292-6.775-2.292-5.834 0-10.566 3.758-10.566 9.128s4.732 9.128 10.566 9.128c5.445 0 10.165-3.332 10.165-9.128 0-0.654-0.082-1.258-0.207-1.839h-9.957z"/></svg>
            ${t('auth.google')}
        </button>
        </form>
        
        <p class="mt-8 text-center text-sm text-muted">
        ${t('auth.hasAccount')} <a href="/login" class="text-neon hover:underline">${t('auth.signIn')}</a>
        </p>
    </div>

    <!-- STEP 2: OTP FORM (Hidden by default) -->
    <div id="step-otp" class="hidden">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-neon/10 text-neon rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h2 class="text-3xl font-bold mb-2 text-primary">Verifica o E-mail</h2>
            <p class="text-muted">Enviámos um código para <br><span id="otp-email-display" class="text-neon font-bold"></span></p>
        </div>

        <div class="space-y-8">
            <div class="space-y-4">
                 <div class="relative group">
                    <input type="text" id="otp-input" 
                        class="w-full bg-surface border-2 border-border focus:border-neon rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-primary focus:outline-none transition-all placeholder-muted/20"
                        placeholder="000000" maxlength="10" autocomplete="one-time-code">
                    <p class="text-xs text-center text-muted mt-2">Cola o código aqui (suporta 6-8 dígitos)</p>
                </div>
            </div>

            <button id="verify-btn" class="w-full bg-neon text-black font-bold py-3 rounded-lg hover:bg-white transition-all shadow-lg shadow-neon/20 mt-4">
                Verificar Código
            </button>

            <div class="flex justify-between items-center text-sm mt-6">
                <button type="button" id="back-otp" class="text-muted hover:text-white transition-colors">← Corrigir E-mail</button>
                <button type="button" id="resend-otp" class="text-neon hover:underline">Reenviar Código</button>
            </div>
        </div>
    </div>
  `;

  // --- LOGIC ---

  // ... (Username Logic Same) ...
  const usernameInput = card.querySelector('#username');
  const statusEl = card.querySelector('#username-status');
  let debounceTimer;

  usernameInput.addEventListener('input', () => {
    // Enforce lowercase alphanumeric only
    const cleaned = usernameInput.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleaned !== usernameInput.value) usernameInput.value = cleaned;
    const val = cleaned;
    statusEl.innerHTML = '';
    if (val.length > 0 && val.length < 4) {
      statusEl.innerHTML = '<span class="text-red-500 text-[10px]">Min. 4</span>';
      return;
    }
    if (val.length < 4) return;
    statusEl.innerHTML = '<span class="text-muted animate-pulse">...</span>';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const { available, error } = await profileService.checkUsernameAvailability(val);
      if (error) { statusEl.innerHTML = ''; return; }
      if (available) statusEl.innerHTML = '<span class="text-green-500">✓ Disponível</span>';
      else statusEl.innerHTML = '<span class="text-red-500">✗ Indisponível</span>';
    }, 500);
  });

  // Toggle Password
  const toggleBtn = card.querySelector('#toggle-password');
  const passwordInput = card.querySelector('#password');
  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    const eyeIcon = card.querySelector('#eye-icon');
    eyeIcon.querySelectorAll('.eye-open').forEach(el => el.classList.toggle('hidden', isPassword));
    eyeIcon.querySelectorAll('.eye-closed').forEach(el => el.classList.toggle('hidden', !isPassword));
  });

  // Signup Submit
  const form = card.querySelector('#signup-form');
  const stepSignup = card.querySelector('#step-signup');
  const stepOtp = card.querySelector('#step-otp');
  const emailDisplay = card.querySelector('#otp-email-display');
  const otpInput = card.querySelector('#otp-input'); // Single Input

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-pulse">${t('admin.loading')}</span>`;

    const name = form.querySelector('#name').value;
    let username = form.querySelector('#username').value.trim();
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    // Sanitize username
    username = username.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Validate manually entered username
    if (username && username.length < 4) {
      Notification.error('O username deve ter pelo menos 4 caracteres.');
      btn.disabled = false;
      btn.innerHTML = originalText;
      return;
    }

    if (username) {
      const { available } = await profileService.checkUsernameAvailability(username);
      if (!available) {
        Notification.error('Este nome de utilizador já está em uso.');
        btn.disabled = false;
        btn.innerHTML = originalText;
        return;
      }
    }

    if (!username) {
      const baseName = (name.split(' ')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
      username = baseName + Math.floor(Math.random() * 9000 + 1000);
    }

    const { data, error } = await authService.signUp(email, password, { name, username });

    if (error) {
      // Handle the case where the user already registered but never verified their email
      const msg = (error.message || '').toLowerCase();

      // Market Standard: If user exists, try to resend OTP. 
      // If it's a confirmed user, resend will likely fail or we can handle it.
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('already exists')) {

        // Attempt to resend the signup OTP
        const { error: resendError } = await authService.resendSignupOtp(email);

        if (resendError) {
          // If resend fails with "Email not found" (unlikely here) or other, it might be a truly taken/confirmed email
          const resendMsg = resendError.message.toLowerCase();
          if (resendMsg.includes('not found') || resendMsg.includes('provider') || resendMsg.includes('already used')) {
            Notification.error('Este e-mail já está em uso e verificado. Tenta iniciar sessão.');
          } else {
            Notification.error('Este e-mail já está registado. Tenta iniciar sessão.');
          }
          btn.disabled = false;
          btn.innerHTML = originalText;
          return;
        }

        // Seamless "Resurrection": Move to OTP step
        Notification.info('Este e-mail tem um registo pendente. Enviámos um novo código de verificação.');
        currentEmail = email;
        emailDisplay.innerText = email;
        stepSignup.classList.add('hidden');
        stepOtp.classList.remove('hidden');
        stepOtp.classList.add('animate-slide-up');
        setTimeout(() => otpInput.focus(), 100);
      } else {
        Notification.error(error.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    } else {
      currentEmail = email;
      emailDisplay.innerText = email;
      stepSignup.classList.add('hidden');
      stepOtp.classList.remove('hidden');
      stepOtp.classList.add('animate-slide-up');

      setTimeout(() => {
        otpInput.focus();
      }, 100);
    }
  });

  // OTP Input Logic (Clean - just numbers)
  otpInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  // Verify OTP
  const verifyBtn = card.querySelector('#verify-btn');
  verifyBtn.addEventListener('click', async () => {
    const token = otpInput.value.trim();

    if (token.length < 6) {
      Notification.error('Código inválido (curto).');
      return;
    }

    verifyBtn.disabled = true;
    verifyBtn.innerText = 'A verificar...';

    const { error } = await authService.verifySignupOtp(currentEmail, token);

    if (error) {
      Notification.error(error.message);
      verifyBtn.disabled = false;
      verifyBtn.innerText = 'Verificar Código';
    } else {
      Notification.success('Conta verificada!');
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new Event('popstate'));
    }
  });

  // 6. Resend & Back
  card.querySelector('#back-otp').addEventListener('click', () => {
    stepOtp.classList.add('hidden');
    stepSignup.classList.remove('hidden');
    form.querySelector('button[type="submit"]').disabled = false;
    form.querySelector('button[type="submit"]').innerHTML = t('auth.createAccount');
  });

  card.querySelector('#resend-otp').addEventListener('click', async () => {
    const resendBtn = card.querySelector('#resend-otp');
    resendBtn.disabled = true;
    resendBtn.innerText = 'A enviar...';

    const { error } = await authService.resendSignupOtp(currentEmail);
    if (error) {
      Notification.error(error.message);
    } else {
      Notification.success('Novo código enviado!');
    }
    setTimeout(() => {
      resendBtn.disabled = false;
      resendBtn.innerText = 'Reenviar Código';
    }, 30000); // 30s cooldown visual
  });

  // Google Sign Up
  const googleBtn = card.querySelector('#google-signup');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      await authService.signInWithGoogle();
    });
  }

  // Check for deep-linked state (from LoginPage)
  const state = window.history.state;
  if (state && state.step === 'otp' && state.email) {
    currentEmail = state.email;
    emailDisplay.innerText = state.email;

    // Pre-populate email field in the hidden form so "Back" works correctly
    const emailField = form.querySelector('#email');
    if (emailField) emailField.value = state.email;

    stepSignup.classList.add('hidden');
    stepOtp.classList.remove('hidden');
    stepOtp.classList.add('animate-slide-up');
    setTimeout(() => otpInput.focus(), 100);
  }

  container.appendChild(card);
  return container;
}
