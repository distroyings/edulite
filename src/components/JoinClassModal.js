import { Modal } from './Modal.js';
import { classService } from '../services/classService.js';

export function JoinClassModal(onSuccess) {
  const container = document.createElement('div');
  container.className = 'w-full flex flex-col text-primary';

  container.innerHTML = `
      <!-- Header -->
      <div class="mb-6 text-center">
          <div class="w-16 h-16 bg-neon/10 rounded-2xl flex items-center justify-center text-neon mx-auto mb-4 border border-neon/20 shadow-[0_0_15px_rgba(var(--color-neon-rgb),0.1)]">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <h3 class="text-3xl font-black mb-1">Entrar na Turma</h3>
          <p class="text-muted text-sm">Insere o código de convite partilhado pelo teu professor.</p>
      </div>
      
      <!-- Error Container (Custom Validation) -->
      <div id="join-error" class="hidden mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 animate-shake">
          <div class="p-2 bg-red-500/10 rounded-full flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <span id="error-msg">Erro ao entrar</span>
      </div>

      <form id="join-form" class="space-y-6">
        <div class="group">
            <div class="flex justify-between items-center mb-2 ml-1">
                <label class="text-xs font-bold text-neon uppercase tracking-widest opacity-80">Código de Convite</label>
            </div>
            <div class="relative">
                <input type="text" name="classId" id="input-code" required 
                    placeholder="" 
                    maxlength="6"
                    class="glass-input !rounded-2xl !px-5 !py-4 text-center text-3xl font-mono font-bold tracking-[0.5em] uppercase">
                
                <div class="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 opacity-0 transition-opacity" id="valid-check">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
            </div>
            <p class="text-xs text-muted text-center mt-3">O código deve ter 6 caracteres (ex: <span class="font-mono text-primary">XY92KZ</span>)</p>
        </div>

        <div class="pt-2 flex justify-end gap-3">
          <button type="button" id="cancel-btn" class="w-full py-4 rounded-2xl text-muted font-bold hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all">Cancelar</button>
          <button type="submit" id="submit-btn" class="w-full py-4 rounded-2xl bg-neon text-white font-black hover:scale-[1.02] active:scale-95 shadow-lg shadow-neon/20 transition-all flex items-center justify-center gap-2">
            <span>ENTRAR</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </button>
        </div>
      </form>
  `;

  const modal = new Modal(container, null, { maxWidth: 'max-w-md' });

  // Event Binding
  const form = container.querySelector('#join-form');
  const input = container.querySelector('#input-code');
  const cancelBtn = container.querySelector('#cancel-btn');
  const submitBtn = container.querySelector('#submit-btn');
  const errorBox = container.querySelector('#join-error');
  const errorMsg = container.querySelector('#error-msg');
  const validCheck = container.querySelector('#valid-check');

  const showError = (msg) => {
    errorMsg.textContent = msg;
    errorBox.classList.remove('hidden');
    errorBox.classList.remove('animate-shake');
    void errorBox.offsetWidth;
    errorBox.classList.add('animate-shake');
    // Auto Hide
    setTimeout(() => errorBox.classList.add('hidden'), 4000);

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>ENTRAR</span> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>`;
  };

  if (cancelBtn) cancelBtn.onclick = () => modal.close();

  // Input formatting
  input.oninput = (e) => {
    let val = e.target.value.toUpperCase();
    // Remove non-alphanumeric
    val = val.replace(/[^A-Z0-9]/g, '');
    e.target.value = val;

    if (val.length === 6) {
      validCheck.classList.remove('opacity-0');
      input.classList.add('border-green-500', 'text-green-500');
      input.classList.remove('border-gray-200', 'dark:border-white/10', 'text-primary');
    } else {
      validCheck.classList.add('opacity-0');
      input.classList.remove('border-green-500', 'text-green-500');
      input.classList.add('border-gray-200', 'dark:border-white/10', 'text-primary');
    }

    if (!errorBox.classList.contains('hidden')) errorBox.classList.add('hidden');
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const code = input.value;

    if (code.length !== 6) {
      showError('O código deve ter exatamente 6 caracteres.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>A Entrar...</span>`;

    try {
      const { error } = await classService.joinClass(code);

      if (error) {
        // Specifically handle "Already member" if needed
        if (error.message.includes('membro')) { // "Já és membro desta turma"
          showError('Já fazes parte desta turma!');
        } else {
          showError(error.message);
        }
      } else {
        modal.close();
        if (onSuccess) onSuccess();
        window.history.pushState({}, '', `/class/${code}`);
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err) {
      console.error(err);
      showError('Ocorreu um erro ao tentar entrar. Tenta novamente.');
    }
  };

  return modal;
}
