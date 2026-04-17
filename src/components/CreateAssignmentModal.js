import { Modal } from './Modal.js';
import { DateTimePicker } from './DateTimePicker.js';
import { assignmentService } from '../services/assignmentService.js';
import { storageService } from '../services/storageService.js';
import { Notification } from '../lib/Notification.js';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const IC = {
    file: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    image: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    archive: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>`,
    video: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
    audio: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/></svg>`,
    spreadsheet: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
    slides: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>`,
    text: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    generic: `<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>`,
};

const FILE_STYLES = {
    pdf: { bg: 'bg-red-500/10', text: 'text-red-500', icon: IC.file },
    doc: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: IC.file },
    docx: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: IC.file },
    xls: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: IC.spreadsheet },
    xlsx: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: IC.spreadsheet },
    ppt: { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: IC.slides },
    pptx: { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: IC.slides },
    zip: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: IC.archive },
    rar: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: IC.archive },
    '7z': { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: IC.archive },
    jpg: { bg: 'bg-pink-500/10', text: 'text-pink-500', icon: IC.image },
    jpeg: { bg: 'bg-pink-500/10', text: 'text-pink-500', icon: IC.image },
    png: { bg: 'bg-pink-500/10', text: 'text-pink-500', icon: IC.image },
    gif: { bg: 'bg-pink-500/10', text: 'text-pink-500', icon: IC.image },
    webp: { bg: 'bg-pink-500/10', text: 'text-pink-500', icon: IC.image },
    mp4: { bg: 'bg-violet-500/10', text: 'text-violet-500', icon: IC.video },
    mp3: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: IC.audio },
    txt: { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: IC.text },
};

function getFileStyle(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return FILE_STYLES[ext] || { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: IC.generic };
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

export function CreateAssignmentModal(classId, onSuccess) {
    const container = document.createElement('div');
    container.className = 'w-full flex flex-col text-primary';

    let selectedFiles = [];

    container.innerHTML = `
      <div class="mb-5">
          <h3 class="text-xl font-black text-primary mb-0.5">Nova Tarefa</h3>
          <p class="text-muted text-xs">Cria e partilha atividades com a turma.</p>
      </div>

      <div id="form-error" class="hidden mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span id="error-msg"></span>
      </div>

      <form id="create-form" class="space-y-4 flex-1 overflow-y-auto pr-1">
          <!-- Title -->
          <div>
              <div class="flex justify-between items-center mb-1.5 ml-0.5">
                  <label class="text-[10px] font-bold text-muted uppercase tracking-wider">Título</label>
                  <span class="text-[10px] text-muted" id="title-counter">0/100</span>
              </div>
              <input type="text" name="title" maxlength="100" required
                  class="glass-input !rounded-xl !px-4 !py-3 text-sm" 
                  placeholder="Ex: Resumo do Capítulo 4">
          </div>

          <!-- Description -->
          <div>
              <label class="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 ml-0.5">Instruções</label>
              <textarea name="description" rows="3" maxlength="500"
                  class="glass-input !rounded-xl !px-4 !py-3 resize-none text-sm" 
                  placeholder="Descreve os detalhes da tarefa..."></textarea>
          </div>

          <!-- Due Date (custom picker will be injected here) -->
          <div>
              <label class="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 ml-0.5">Data de Entrega</label>
              <div id="date-picker-slot"></div>
          </div>

          <!-- Grading Toggle -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]">
              <div>
                  <p class="text-sm font-bold text-primary">Com Avaliação</p>
                  <p class="text-[10px] text-muted">Permitir atribuir notas</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="grading-toggle" class="sr-only peer">
                  <div class="w-10 h-5 bg-gray-300 dark:bg-white/10 peer-checked:bg-neon rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5"></div>
              </label>
          </div>

          <!-- Grading Options (hidden) -->
          <div id="grading-options" class="hidden">
              <label class="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 ml-0.5">Nota Máxima</label>
              <div class="flex items-center gap-2">
                  <input type="number" name="maxGrade" id="max-grade-input" value="20" min="1" max="1000"
                      class="glass-input !rounded-xl !px-4 !py-2.5 text-sm w-20 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                  <span class="text-xs text-muted">valores</span>
                  <div class="flex gap-1 ml-auto">
                      ${[10, 20, 100].map(v => `<button type="button" data-grade="${v}" class="grade-preset px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${v === 20 ? 'border-neon text-neon bg-neon/10' : 'border-gray-200 dark:border-white/10 text-muted hover:border-neon hover:text-neon'}">${v}</button>`).join('')}
                  </div>
              </div>
          </div>

          <!-- Multi-File Upload -->
          <div>
              <div class="flex items-center justify-between mb-1.5 ml-0.5">
                  <label class="text-[10px] font-bold text-muted uppercase tracking-wider">Anexos</label>
                  <span class="text-[10px] text-muted font-bold" id="file-counter">0/${MAX_FILES} ficheiros</span>
              </div>

              <!-- File list -->
              <div id="files-list" class="space-y-2 mb-2 max-h-[150px] overflow-y-auto pr-1" style="scrollbar-width: thin;"></div>

              <!-- Add file zone -->
              <div id="add-file-zone" class="relative rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-neon/40 transition-colors cursor-pointer flex items-center justify-center p-3">
                  <input type="file" id="file-upload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" multiple accept="*/*">
                  <div class="flex items-center gap-2 pointer-events-none">
                      <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <span class="text-xs text-muted">PDF, Word, ZIP, Imagens… (máx. ${MAX_FILES}, 10MB cada)</span>
                  </div>
              </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 flex gap-2 border-t border-gray-200 dark:border-white/5">
              <button type="button" id="cancel-btn" class="flex-1 px-4 py-2.5 rounded-xl text-muted font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">Cancelar</button>
              <button type="submit" id="submit-btn" class="flex-1 px-4 py-2.5 rounded-xl bg-neon text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <span>Publicar</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
          </div>
      </form>
  `;

    const modal = new Modal(container, null, { maxWidth: 'max-w-md' });

    // Elements
    const form = container.querySelector('#create-form');
    const titleInput = form.querySelector('[name="title"]');
    const titleCounter = container.querySelector('#title-counter');
    const gradingToggle = container.querySelector('#grading-toggle');
    const gradingOptions = container.querySelector('#grading-options');
    const maxGradeInput = container.querySelector('#max-grade-input');
    const fileInput = container.querySelector('#file-upload');
    const filesList = container.querySelector('#files-list');
    const addFileZone = container.querySelector('#add-file-zone');
    const fileCounter = container.querySelector('#file-counter');
    const errorBox = container.querySelector('#form-error');
    const errorMsg = container.querySelector('#error-msg');
    const submitBtn = container.querySelector('#submit-btn');

    // Date picker
    let selectedDueDate = '';
    const datePicker = DateTimePicker({
        onChange: (iso) => { selectedDueDate = iso; }
    });
    container.querySelector('#date-picker-slot').appendChild(datePicker.element);

    // Cancel
    container.querySelector('#cancel-btn').onclick = () => modal.close();

    // Title counter
    titleInput.oninput = () => titleCounter.textContent = `${titleInput.value.length}/100`;

    // Grading toggle
    gradingToggle.onchange = () => gradingOptions.classList.toggle('hidden', !gradingToggle.checked);

    // Presets
    container.querySelectorAll('.grade-preset').forEach(btn => {
        btn.onclick = () => {
            maxGradeInput.value = btn.dataset.grade;
            container.querySelectorAll('.grade-preset').forEach(b => {
                b.className = b === btn
                    ? 'grade-preset px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-neon text-neon bg-neon/10 transition-colors'
                    : 'grade-preset px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-gray-200 dark:border-white/10 text-muted hover:border-neon hover:text-neon transition-colors';
            });
        };
    });

    // ═══ Multi-file handling ═══
    function renderFiles() {
        fileCounter.textContent = `${selectedFiles.length}/${MAX_FILES} ficheiros`;

        if (selectedFiles.length >= MAX_FILES) {
            addFileZone.classList.add('opacity-40', 'pointer-events-none');
        } else {
            addFileZone.classList.remove('opacity-40', 'pointer-events-none');
        }

        filesList.innerHTML = '';
        selectedFiles.forEach((file, idx) => {
            const style = getFileStyle(file.name);
            const row = document.createElement('div');
            row.className = 'flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] group/file';
            row.innerHTML = `
                <div class="w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0">${style.icon}</div>
                <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-bold text-primary truncate">${file.name}</p>
                    <p class="text-[9px] text-muted">${formatSize(file.size)}</p>
                </div>
                <button type="button" data-idx="${idx}" class="remove-file-btn p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90 flex-shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            filesList.appendChild(row);
        });

        filesList.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                selectedFiles.splice(parseInt(btn.dataset.idx), 1);
                renderFiles();
            };
        });
    }

    fileInput.onchange = () => {
        const newFiles = Array.from(fileInput.files);
        for (const file of newFiles) {
            if (selectedFiles.length >= MAX_FILES) {
                showError(`Máximo de ${MAX_FILES} ficheiros.`);
                break;
            }
            if (file.size > MAX_FILE_SIZE) {
                showError(`"${file.name}" excede 10MB.`);
                continue;
            }
            if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) continue;
            selectedFiles.push(file);
        }
        fileInput.value = '';
        renderFiles();
    };

    const showError = (msg) => {
        errorMsg.textContent = msg;
        errorBox.classList.remove('hidden');
        setTimeout(() => errorBox.classList.add('hidden'), 5000);
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Publicar</span> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>`;
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        if (!title) return showError('O título é obrigatório.');

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>A publicar...</span>`;

        const desc = form.querySelector('[name="description"]').value;
        const hasGrading = gradingToggle.checked;
        const maxGrade = hasGrading ? parseFloat(maxGradeInput.value) || 20 : 20;

        // Upload all selected files
        let fileUrl = null;
        if (selectedFiles.length > 0) {
            const uploadedUrls = [];
            for (const file of selectedFiles) {
                const path = `assignments/${classId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                const { error: uploadError } = await storageService.uploadFile('assignments', path, file);
                if (uploadError) return showError(`Falha no upload de "${file.name}".`);
                uploadedUrls.push(storageService.getPublicUrl('assignments', path));
            }
            fileUrl = uploadedUrls.join('|||');
        }

        const { error } = await assignmentService.createAssignment(classId, title, desc, selectedDueDate || null, fileUrl, hasGrading, maxGrade);

        if (error) {
            showError(error.message);
        } else {
            Notification.success('Tarefa publicada!');
            modal.close();
            if (onSuccess) onSuccess();
        }
    };

    renderFiles();
    return modal;
}
