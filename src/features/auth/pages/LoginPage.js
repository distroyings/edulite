import { authService } from '../services/authService.js';
import { Modal } from '../../../components/Modal.js';
import { Notification } from '../../../lib/Notification.js';
import { t } from '../../../lib/i18n.js';

export async function LoginPage() {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center relative overflow-hidden bg-background';

  // Background blobs
  const blob1 = document.createElement('div');
  blob1.className = 'absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full animate-pulse pointer-events-none';
  container.appendChild(blob1);

  const backLink = document.createElement('a');
  backLink.href = '/';
  backLink.className = 'fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface/80 backdrop-blur-lg border border-border text-muted hover:text-primary text-sm transition-all hover:bg-surface group';
  backLink.innerHTML = `<svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg> EduLite`;
  container.appendChild(backLink);

  const card = document.createElement('div');
  card.className = 'glass-panel p-8 md:p-12 rounded-2xl w-full max-w-md mx-4 relative z-10 animate-slide-up';

  card.innerHTML = `
    <h2 class="text-3xl font-bold mb-2 text-center text-primary">${t('auth.welcome')}</h2>
    <p class="text-muted text-center mb-8">${t('auth.loginSubtitle')}</p>
    
    <form id="login-form" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-muted mb-1">E-mail ou @utilizador</label>
        <input type="text" id="identifier" required maxlength="100"
          class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-colors placeholder-muted/50"
          placeholder="exemplo@escola.pt ou @utilizador">
      </div>
      
      <div>
        <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-medium text-muted">${t('auth.password')}</label>
            <a href="/forgot-password" class="text-xs text-neon hover:underline">Esqueceste-te da palavra-passe?</a>
        </div>

        <div class="relative group">
            <input type="password" id="password" required maxlength="72"
              class="w-full bg-surface border border-border dark:bg-white/5 dark:border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/50 transition-colors placeholder-muted/50"
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

      <button type="submit" 
        class="w-full bg-neon text-black font-bold py-3 rounded-lg hover:bg-white transition-all duration-300 shadow-lg shadow-neon/20 hover:shadow-white/20">
        ${t('auth.signIn')}
      </button>

      <div class="relative py-4">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
        <div class="relative flex justify-center text-sm"><span class="px-2 bg-background text-muted">${t('auth.orContinue')}</span></div>
      </div>

      <button type="button" id="google-login"
        class="w-full glass-input text-primary font-semibold py-3 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.536-6.033-5.696s2.7-5.696 6.033-5.696c1.482 0 2.846 0.499 3.921 1.488l2.853-2.627c-1.841-1.529-4.275-2.292-6.775-2.292-5.834 0-10.566 3.758-10.566 9.128s4.732 9.128 10.566 9.128c5.445 0 10.165-3.332 10.165-9.128 0-0.654-0.082-1.258-0.207-1.839h-9.957z"/></svg>
        ${t('auth.google')}
      </button>
    </form>
    
    <p class="mt-8 text-center text-sm text-muted">
      ${t('auth.noAccount')} <a href="/signup" class="text-neon hover:underline">${t('auth.signUp')}</a>
    </p>
  `;

  // Event Listeners
  const form = card.querySelector('#login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-pulse">${t('admin.loading')}</span>`;

    const identifier = form.querySelector('#identifier').value;
    const password = form.querySelector('#password').value;

    const { error } = await authService.signIn(identifier, password);

    if (error) {
      const msg = (error.message || '').toLowerCase();

      // Market Standard: Handle Unconfirmed Email
      if (msg.includes('email not confirmed') || msg.includes('verificar o seu email')) {
        // Find email from identifier if it's an email, or show a better message
        const isEmail = identifier.includes('@') && !identifier.startsWith('@');

        Notification.info(
          isEmail
            ? `O teu e-mail ainda não foi verificado. Enviámos-te um novo código para ${identifier}.`
            : 'A tua conta ainda não foi verificada. Por favor, faz signup novamente com o teu e-mail para receberes o código.'
        );

        if (isEmail) {
          // Store state and redirect to Signup page's OTP step
          // Since we are in a SPA, we can just navigate or trigger resend
          await authService.resendSignupOtp(identifier);
          window.history.pushState({ email: identifier, step: 'otp' }, '', '/signup');
          window.dispatchEvent(new Event('popstate'));
        }
      } else {
        Notification.error(error.message);
      }

      btn.disabled = false;
      btn.innerHTML = originalText;
    } else {
      // Router or global listener will handle redirect
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new Event('popstate'));
    }
  });

  const toggleBtn = card.querySelector('#toggle-password');
  const passwordInput = card.querySelector('#password');
  const eyeIcon = card.querySelector('#eye-icon');

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    // Animation effect
    eyeIcon.classList.add('scale-110');
    setTimeout(() => eyeIcon.classList.remove('scale-110'), 200);

    eyeIcon.querySelectorAll('.eye-open').forEach(el => el.classList.toggle('hidden', isPassword));
    eyeIcon.querySelectorAll('.eye-closed').forEach(el => el.classList.toggle('hidden', !isPassword));
  });

  const googleBtn = card.querySelector('#google-login');
  googleBtn.addEventListener('click', async () => {
    await authService.signInWithGoogle();
  });




  container.appendChild(card);
  return container;
}
