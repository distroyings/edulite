import { Modal } from './Modal.js';
import { classService } from '../services/classService.js';

export function CreateClassModal(onSuccess) {
  let activeTab = 'general';

  // Default State with specific default gradient (Blue-ish)
  let formData = {
    name: '',
    description: '',
    // Default to a nice blue gradient constructed from HSL
    banner_url: 'linear-gradient(135deg, hsl(210, 85%, 60%), hsl(210, 70%, 40%))',
    avatar_url: '',
    chat_enabled: true,
    is_locked: false
  };

  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col';

  // Helper function to render the color preview based on HSL
  const getGradient = (hue) => `linear-gradient(135deg, hsl(${hue}, 85%, 60%), hsl(${hue}, 70%, 40%))`;

  const render = () => {
    // Current Banner Style for Preview
    const bannerStyle = `background: ${formData.banner_url}`;

    container.innerHTML = `
      <div class="flex flex-col h-full text-primary" id="class-modal-content">
          
          <!-- Header -->
          <div class="mb-4 flex-shrink-0">
              <h3 class="text-2xl font-black mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-white/60">Criar Nova Turma</h3>
              <p class="text-muted text-[13px]">Configura o teu novo espaço de aprendizagem.</p>
          </div>

          <!-- Error Alert (Custom Validation) -->
          <div id="form-error" class="hidden flex-shrink-0 mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 animate-shake">
              <div class="p-2 bg-red-500/10 rounded-full flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <span id="error-msg">Erro de validação</span>
          </div>

          <!-- Tabs -->
          <div class="flex-shrink-0 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 mb-5 w-full overflow-x-auto scrollbar-hide flex">
              ${renderTab('general', 'Geral')}
              ${renderTab('appearance', 'Aparência')}
              ${renderTab('settings', 'Definições')}
          </div>

          <!-- Scrollable Form Content -->
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[280px]">
              
              <!-- TAB: GENERAL -->
              <div class="${activeTab === 'general' ? 'block' : 'hidden'} space-y-6 animate-fade-in px-1">
                  
                  <!-- Name Input -->
                  <div class="group">
                      <div class="flex justify-between items-center mb-2 ml-1">
                          <label class="text-xs font-bold text-neon uppercase tracking-widest opacity-80">Nome da Turma</label>
                          <span class="text-[10px] text-muted font-mono" id="name-counter">${formData.name.length}/50</span>
                      </div>
                      <input type="text" id="input-name" value="${formData.name}" maxlength="50"
                          class="glass-input !rounded-2xl !px-5 !py-4 text-lg" 
                          placeholder="Ex: Matemática 12º A">
                      <p class="text-[11px] text-muted mt-2 ml-1 hidden group-focus-within:block animate-fade-in">O nome que aparecerá no dashboard e convites.</p>
                  </div>

                  <!-- Description Input -->
                  <div class="group">
                      <div class="flex justify-between items-center mb-2 ml-1">
                          <label class="text-xs font-bold text-muted uppercase tracking-widest">Descrição</label>
                          <span class="text-[10px] text-muted font-mono" id="desc-counter">${formData.description.length}/200</span>
                      </div>
                      <textarea id="input-desc" rows="4" maxlength="200"
                          class="glass-input !rounded-2xl !px-5 !py-4 resize-none" 
                          placeholder="Uma breve descrição sobre os objetivos desta turma...">${formData.description}</textarea>
                  </div>
              </div>

              <!-- TAB: APPEARANCE -->
              <div class="${activeTab === 'appearance' ? 'block' : 'hidden'} space-y-8 animate-fade-in px-1">
                  
                  <!-- Live Preview Card -->
                  <div class="relative w-full h-40 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 group bg-gray-100 dark:bg-black/40">
                      <!-- Dynamic Background -->
                      <div class="absolute inset-0 transition-opacity duration-500" style="${bannerStyle}" id="banner-preview-bg"></div>
                      
                      <!-- Glass Overlay/Texture -->
                      <div class="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[0.5px]"></div>
                      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>

                      <!-- Preview Content -->
                      <div class="absolute bottom-4 left-4 right-4 flex items-end">
                          <div class="flex items-center gap-3">
                              <div class="w-12 h-12 rounded-xl border border-white/30 flex items-center justify-center text-2xl shadow-md text-white overflow-hidden relative" id="avatar-preview-container" style="${bannerStyle}">
                                   <div class="absolute inset-0 bg-white/10"></div>
                                  <span id="logo-preview-icon" class="relative z-10">${formData.avatar_url || '🎓'}</span>
                              </div>
                              <div class="flex flex-col gap-1.5">
                                  <div class="h-4 w-36 bg-white/90 rounded-full"></div>
                                  <div class="h-2.5 w-20 bg-white/50 rounded-full"></div>
                              </div>
                          </div>
                      </div>

                      <!-- Badge Preview -->
                      <div class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider">
                          PREVIEW
                      </div>
                  </div>

                  <!-- Color Picker (Hue Slider) -->
                  <div>
                      <div class="flex justify-between items-end mb-3">
                           <label class="block text-xs font-bold text-muted uppercase tracking-widest">Cor Principal</label>
                           <div class="px-3 py-1 rounded-lg bg-white dark:bg-black/20 text-xs font-mono font-bold text-primary border border-gray-200 dark:border-white/10" id="hue-display">
                               Azul Ocean
                           </div>
                      </div>
                      
                      <!-- Slider Track -->
                      <div class="relative h-8 w-full rounded-xl ring-2 ring-gray-200 dark:ring-white/10 overflow-hidden">
                          <!-- Rainbow Gradient -->
                          <div class="absolute inset-0 w-full h-full" style="background: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444);"></div>
                          
                          <!-- Browser Range Input (Invisible but interactive) -->
                          <input type="range" id="input-hue" min="0" max="360" value="210" 
                              class="absolute inset-0 w-full h-full appearance-none cursor-pointer opacity-0 z-20"
                          >
                          
                          <!-- Custom Thumb Indicator -->
                          <div id="slider-thumb" class="absolute top-0 bottom-0 w-4 bg-white border-x-2 border-black/10 shadow-[0_0_15px_rgba(0,0,0,0.3)] pointer-events-none transform -translate-x-1/2 transition-transform duration-75 z-10 flex items-center justify-center" style="left: 58.33%">
                             <div class="w-1 h-4 bg-gray-300 rounded-full"></div>
                          </div>
                      </div>
                      <p class="text-[11px] text-muted mt-2.5 text-center">Desliza para personalizar a identidade visual da turma.</p>
                  </div>

                  <!-- Icon Input (Emoji Picker) -->
                  <div>
                       <label class="block text-xs font-bold text-muted mb-3 ml-1 uppercase tracking-widest">Ícone da Turma</label>
                       
                       <div class="space-y-4">
                           <!-- Selected Icon Display & Toggle -->
                           <div class="flex items-center gap-4 cursor-pointer group" id="icon-picker-toggle">
                               <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-3xl shadow-sm group-hover:border-neon group-hover:ring-2 group-hover:ring-neon/20 transition-all">
                                   <span id="selected-icon-display">${formData.avatar_url || '🎓'}</span>
                               </div>
                               <div>
                                   <p class="text-sm font-bold text-primary group-hover:text-neon transition-colors">Escolher Ícone</p>
                                   <p class="text-xs text-muted">Toque para selecionar um emoji</p>
                               </div>
                           </div>

                           <!-- Emoji Grid (Hidden by default) -->
                           <div id="emoji-picker-container" class="hidden p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 animate-fade-in-up">
                               <div class="grid grid-cols-8 gap-2 max-h-[160px] overflow-y-auto scrollbar-hide" id="emoji-grid">
                                   <!-- Populated by JS -->
                               </div>
                           </div>
                       </div>
                  </div>
              </div>

              <!-- TAB: SETTINGS -->
              <div class="${activeTab === 'settings' ? 'block' : 'hidden'} space-y-4 animate-fade-in px-1">
                   ${renderToggle('Chat da Turma', 'Permitir que os alunos enviem mensagens na aba Comunidade.', 'bg-neon/10 text-neon', formData.chat_enabled, 'input-chat')}
                   ${renderToggle('Turma Privada', 'Apenas utilizadores com convite podem entrar.', 'bg-rose-500/10 text-rose-500', formData.is_locked, 'input-locked')}
                   
                   <div class="mt-8 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                        <div class="flex gap-4">
                            <div class="p-2 bg-blue-500/10 rounded-xl h-min text-blue-500">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <h4 class="font-bold text-primary text-sm mb-1">Nota sobre Definições</h4>
                                <p class="text-xs text-muted leading-relaxed">Podes alterar estas definições a qualquer momento na página de gestão da turma.</p>
                            </div>
                        </div>
                   </div>
              </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex-shrink-0 pt-6 mt-4 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3 items-center">
              <button type="button" id="cancel-btn" class="px-6 py-3 rounded-2xl text-muted font-bold hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm">Cancelar</button>
              <button type="button" id="submit-btn" class="px-8 py-3 rounded-2xl bg-neon text-white font-black hover:scale-[1.02] active:scale-95 shadow-lg shadow-neon/20 transition-all flex items-center gap-2 text-sm tracking-wide">
                  <span>CRIAR TURMA</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </button>
          </div>
      </div>

      <!-- SUCCESS SCREEN -->
      <div id="success-view" class="hidden flex-col items-center justify-center text-center py-6 h-full animate-scale-in relative">
          <div class="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 mb-8 border border-green-500/20 shadow-xl shadow-green-500/10 animate-float">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          </div>
          
          <h3 class="text-4xl font-black text-primary mb-3 tracking-tight">Turma Criada!</h3>
          <p class="text-muted mb-10 text-sm max-w-xs mx-auto">Tudo pronto. Partilha este código com os teus alunos para entrarem.</p>
          
          <div class="relative group cursor-pointer w-full max-w-xs mx-auto p-8 rounded-[2rem] bg-surface dark:bg-white/5 border border-border dark:border-white/10 hover:border-neon transition-colors" id="copy-code-area">
              <p class="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-4">CÓDIGO DE CONVITE</p>
              <h1 class="text-5xl font-mono font-black text-primary tracking-widest mb-6 select-all" id="success-code">...</h1>
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 text-neon border border-neon/20 text-xs font-bold group-hover:bg-neon group-hover:text-white transition-colors duration-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                  <span id="copy-text">TOQUE PARA COPIAR</span>
              </div>
          </div>

          <div class="mt-auto w-full max-w-sm pt-8">
              <button id="finish-btn" class="w-full py-4 rounded-2xl bg-primary text-surface font-black hover:opacity-90 transition-all shadow-xl hover:shadow-2xl transform active:scale-95 text-sm tracking-widest uppercase">Entrar na Turma</button>
          </div>
      </div>
    `;

    bindEvents();
  };

  const renderTab = (id, label) => {
    const isActive = activeTab === id;
    const baseClass = "tab-btn px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden";
    const activeClass = "bg-white dark:bg-white/10 text-primary shadow-sm dark:shadow-none ring-1 ring-black/5 dark:ring-white/10";
    const inactiveClass = "text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5";
    return `<button data-tab="${id}" class="${baseClass} ${isActive ? activeClass : inactiveClass}">${label}</button>`;
  };

  const renderToggle = (title, desc, iconBg, checked, id) => `
    <div class="flex items-center justify-between p-5 rounded-3xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer group">
       <div class="flex items-center gap-4">
           <div class="p-3 rounded-xl ${iconBg}">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
           </div>
           <div>
               <h4 class="font-bold text-primary group-hover:text-neon transition-colors text-sm">${title}</h4>
               <p class="text-xs text-muted mt-0.5">${desc}</p>
           </div>
       </div>
       <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="${id}" class="sr-only peer" ${checked ? 'checked' : ''}>
          <div class="w-12 h-7 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon shadow-inner"></div>
        </label>
   </div>
  `;

  // Custom Error Display Function
  const showError = (msg) => {
    const el = container.querySelector('#form-error');
    const txt = container.querySelector('#error-msg');
    txt.textContent = msg;

    // Show
    el.classList.remove('hidden');

    // Trigger Re-flow for animation
    el.classList.remove('animate-shake');
    void el.offsetWidth;
    el.classList.add('animate-shake');

    // Auto Hide
    setTimeout(() => {
      if (el) el.classList.add('hidden');
    }, 4000);

    // Scroll to top if needed inside modal content
    const content = container.querySelector('.overflow-y-auto');
    if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bindEvents = () => {
    // Tab Switching
    container.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => {
      activeTab = btn.dataset.tab;
      render();
    });

    // Input Counters & State Update
    const setVal = (sel, field, counterSel, max) => {
      const el = container.querySelector(sel);
      if (el) {
        // Focus effect to keep keyboard open on mobile or just pure focus
        el.oninput = (e) => {
          formData[field] = e.target.value;
          if (counterSel) container.querySelector(counterSel).textContent = `${e.target.value.length}/${max}`;

          // Live hide errors
          const err = container.querySelector('#form-error');
          if (err && !err.classList.contains('hidden')) err.classList.add('hidden');
        };
      }
    };
    setVal('#input-name', 'name', '#name-counter', 50);
    setVal('#input-desc', 'description', '#desc-counter', 200);

    // Toggles
    const setCheck = (sel, field) => { const el = container.querySelector(sel); if (el) el.onchange = (e) => formData[field] = e.target.checked; };
    setCheck('#input-chat', 'chat_enabled');
    setCheck('#input-locked', 'is_locked');

    // Define hue logic variables (scoped within render)
    const hueInput = container.querySelector('#input-hue');
    const thumb = container.querySelector('#slider-thumb');
    const hueVal = container.querySelector('#hue-display');
    const preview = container.querySelector('#banner-preview-bg');
    const avatarPreviewContainer = container.querySelector('#avatar-preview-container');

    if (hueInput) {
      const getHueLabel = (h) => {
        h = parseInt(h);
        if (h < 15 || h > 345) return 'Vermelho';
        if (h < 45) return 'Laranja';
        if (h < 75) return 'Amarelo';
        if (h < 150) return 'Verde';
        if (h < 200) return 'Ciano / Turquesa';
        if (h < 260) return 'Azul';
        if (h < 290) return 'Roxo';
        return 'Rosa';
      };

      const setHue = (h) => {
        const pct = (h / 360) * 100;
        if (thumb) thumb.style.left = `${pct}%`;
        if (hueVal) hueVal.textContent = getHueLabel(h);

        const css = getGradient(h);
        formData.banner_url = css;
        formData.hue = h; // Persist hue
        if (preview) preview.style.background = css;
        if (avatarPreviewContainer) avatarPreviewContainer.style.background = css;
      };

      hueInput.oninput = (e) => setHue(e.target.value);

      // Restore State
      if (formData.hue !== undefined) {
        hueInput.value = formData.hue;
        setHue(formData.hue); // Visual update
      }
    }

    // --- Emoji Picker Logic ---
    const pickerToggle = container.querySelector('#icon-picker-toggle');
    const pickerContainer = container.querySelector('#emoji-picker-container');
    const emojiGrid = container.querySelector('#emoji-grid');
    const displayIcon = container.querySelector('#selected-icon-display');
    const previewIcon = container.querySelector('#logo-preview-icon');

    // Default icon update
    if (previewIcon && formData.avatar_url) previewIcon.textContent = formData.avatar_url;

    const emojis = [
      '🎓', '📚', '✏️', '💻', '🧪', '🧬', '📐', '🎨',
      '🎵', '⚽', '🏀', '🌍', '🏛️', '🎬', '💡', '🚀',
      '📝', '📊', '🔬', '🗣️', '💭', '🧩', '🏆', '⭐',
      '⏰', '📅', '📌', '📖', '🧱', '🛠️', '⚖️', '💶'
    ];

    if (pickerToggle) {
      pickerToggle.onclick = () => {
        pickerContainer.classList.toggle('hidden');
        // Scroll to bottom so picker is visible
        const content = container.querySelector('.overflow-y-auto');
        if (content) setTimeout(() => content.scrollTo({ top: content.scrollHeight, behavior: 'smooth' }), 50);
      };
    }

    if (emojiGrid) {
      emojiGrid.innerHTML = emojis.map(emo => `
            <button type="button" class="aspect-square flex items-center justify-center text-2xl hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors ${emo === (formData.avatar_url || '🎓') ? 'bg-neon/20 ring-2 ring-neon/50' : ''}" data-emoji="${emo}">
                ${emo}
            </button>
        `).join('');

      emojiGrid.querySelectorAll('button').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation(); // prevent modal close if clicked
          const emo = btn.dataset.emoji;
          formData.avatar_url = emo;

          // Update Inputs & Displays
          if (displayIcon) displayIcon.textContent = emo;
          if (previewIcon) previewIcon.textContent = emo;

          // Highlight selection
          emojiGrid.querySelectorAll('button').forEach(b => b.classList.remove('bg-neon/20', 'ring-2', 'ring-neon/50'));
          btn.classList.add('bg-neon/20', 'ring-2', 'ring-neon/50');

          // Close picker
          pickerContainer.classList.add('hidden');
        };
      });
    }

    // Bind Footer Actions
    const cancelBtn = container.querySelector('#cancel-btn');
    if (cancelBtn) cancelBtn.onclick = () => {
      // Simple close
      modal.close();
    };

    const submit = container.querySelector('#submit-btn');
    if (submit) submit.onclick = async () => {
      const name = formData.name.trim();
      if (!name) {
        showError('O nome da turma é obrigatório.');
        return;
      }

      submit.disabled = true;
      submit.textContent = 'A criar...';

      const { data, error } = await classService.createClass(
        formData.name,
        formData.description,
        {
          banner_url: formData.banner_url,
          avatar_url: formData.avatar_url,
          chat_enabled: formData.chat_enabled,
          is_locked: formData.is_locked
        }
      );

      if (error) {
        showError(error.message);
        submit.disabled = false;
        submit.innerHTML = `<span>CRIAR TURMA</span> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>`;
      } else {
        // Show Success View
        container.querySelector('#class-modal-content').classList.add('hidden');
        const successView = container.querySelector('#success-view');
        successView.classList.remove('hidden');
        successView.style.display = 'flex';

        container.querySelector('#success-code').textContent = data.invite_code;

        container.querySelector('#copy-code-area').onclick = () => {
          const code = data.invite_code;
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(code);
          } else {
            const ta = Object.assign(document.createElement('textarea'), { value: code });
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
          }
          const txt = container.querySelector('#copy-text');
          txt.textContent = 'COPIADO!';
          txt.parentElement.classList.add('bg-green-500', 'text-white', 'border-transparent');
          txt.parentElement.classList.remove('bg-neon/10', 'text-neon', 'border-neon/20');

          setTimeout(() => {
            txt.textContent = 'TOQUE PARA COPIAR';
            txt.parentElement.classList.remove('bg-green-500', 'text-white', 'border-transparent');
            txt.parentElement.classList.add('bg-neon/10', 'text-neon', 'border-neon/20');
          }, 2000);
        };

        container.querySelector('#finish-btn').onclick = () => {
          modal.close();
          window.history.pushState({}, '', `/class/${data.id}`);
          window.dispatchEvent(new Event('popstate'));
        };
      }
    };
  };

  // Set initial hue if not set
  if (formData.hue === undefined) formData.hue = 210;

  render();
  const modal = new Modal(container, null, { maxWidth: 'max-w-xl' });
  return modal;
}
