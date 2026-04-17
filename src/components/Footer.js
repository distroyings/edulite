import { t } from '../lib/i18n.js';
import { Logo } from './Logo.js';

export function Footer() {
  const footer = document.createElement('footer');
  footer.className = 'w-full border-t border-border/40 relative z-10 bg-background/80 backdrop-blur-sm';
  footer.innerHTML = `
    <div class="max-w-6xl mx-auto px-6 py-8 md:py-10">
      <!-- Desktop: single row -->
      <div class="hidden md:flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          ${Logo.fullSolid('sm')}
          <span class="text-[10px] text-muted">&copy; ${new Date().getFullYear()}</span>
        </div>
        <nav class="flex items-center gap-5">
          <a href="#about" class="text-xs text-muted hover:text-neon transition-colors">${t('nav.about')}</a>
          <a href="#features" class="text-xs text-muted hover:text-neon transition-colors">${t('nav.features')}</a>
          <a href="/docs" class="text-xs text-muted hover:text-neon transition-colors">Docs</a>
          <button data-legal="privacy" class="text-xs text-muted hover:text-neon transition-colors">${t('footer.privacy')}</button>
          <button data-legal="terms" class="text-xs text-muted hover:text-neon transition-colors">${t('footer.terms')}</button>
          <button data-contact class="text-xs text-muted hover:text-neon transition-colors">${t('footer.contact')}</button>
        </nav>
      </div>
      <!-- Mobile: centered stack -->
      <div class="md:hidden flex flex-col items-center text-center gap-4">
        <div class="flex items-center gap-2">
          ${Logo.fullSolid('xs')}
          <span class="text-[10px] text-muted">&copy; ${new Date().getFullYear()}</span>
        </div>
        <div class="grid grid-cols-3 gap-x-6 gap-y-1.5">
          <a href="#about" class="text-[11px] text-muted hover:text-neon transition-colors">${t('nav.about')}</a>
          <a href="#features" class="text-[11px] text-muted hover:text-neon transition-colors">${t('nav.features')}</a>
          <a href="/docs" class="text-[11px] text-muted hover:text-neon transition-colors">Docs</a>
          <button data-legal="privacy" class="text-[11px] text-muted hover:text-neon transition-colors">${t('footer.privacy')}</button>
          <button data-legal="terms" class="text-[11px] text-muted hover:text-neon transition-colors">${t('footer.terms')}</button>
          <button data-contact class="text-[11px] text-muted hover:text-neon transition-colors">${t('footer.contact')}</button>
        </div>
      </div>
    </div>
  `;

  // ── Legal popup content ──
  const legalContent = {
    privacy: {
      title: 'Política de Privacidade',
      body: `
        <div class="space-y-4 text-sm text-muted leading-relaxed">
          <p>Última atualização: ${new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h3 class="text-base font-bold text-primary">1. Informações Recolhidas</h3>
          <p>Recolhemos apenas as informações necessárias para o funcionamento da plataforma: nome, email, dados de perfil e informações académicas que partilhas voluntariamente.</p>

          <h3 class="text-base font-bold text-primary">2. Utilização dos Dados</h3>
          <p>Os teus dados são utilizados exclusivamente para:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Gerir a tua conta e autenticação</li>
            <li>Fornecer as funcionalidades da plataforma (turmas, avaliações, mensagens)</li>
            <li>Enviar notificações relevantes sobre as tuas turmas</li>
          </ul>

          <h3 class="text-base font-bold text-primary">3. Partilha de Dados</h3>
          <p>Não vendemos, partilhamos ou distribuímos os teus dados pessoais a terceiros. Os dados são armazenados de forma segura nos servidores do Supabase com encriptação.</p>

          <h3 class="text-base font-bold text-primary">4. Segurança</h3>
          <p>Utilizamos encriptação end-to-end, autenticação segura (OAuth 2.0) e políticas de segurança ao nível da base de dados (Row Level Security) para proteger os teus dados.</p>

          <h3 class="text-base font-bold text-primary">5. Os Teus Direitos</h3>
          <p>Podes a qualquer momento aceder, editar ou eliminar os teus dados pessoais através das definições da conta. Para eliminação total, contacta-nos.</p>

          <h3 class="text-base font-bold text-primary">6. Cookies</h3>
          <p>Utilizamos apenas cookies essenciais para sessão e preferências (tema). Não utilizamos cookies de rastreamento ou publicidade.</p>
        </div>
      `
    },
    terms: {
      title: 'Termos de Utilização',
      body: `
        <div class="space-y-4 text-sm text-muted leading-relaxed">
          <p>Última atualização: ${new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h3 class="text-base font-bold text-primary">1. Aceitação dos Termos</h3>
          <p>Ao utilizar o EduLite, concordas com estes termos. Se não concordares, não utilizes a plataforma.</p>

          <h3 class="text-base font-bold text-primary">2. Descrição do Serviço</h3>
          <p>O EduLite é uma plataforma educativa gratuita que permite a criação e gestão de turmas, avaliações, recursos e comunicação entre professores e alunos.</p>

          <h3 class="text-base font-bold text-primary">3. Conta do Utilizador</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>Deves fornecer informações verdadeiras ao criar a tua conta</li>
            <li>És responsável pela segurança da tua palavra-passe</li>
            <li>Uma conta por pessoa — não partilhes a tua conta</li>
          </ul>

          <h3 class="text-base font-bold text-primary">4. Conduta do Utilizador</h3>
          <p>Comprometes-te a não:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Partilhar conteúdo ofensivo, ilegal ou inapropriado</li>
            <li>Interferir com o funcionamento da plataforma</li>
            <li>Usar a plataforma para fins não educativos</li>
            <li>Tentar aceder a contas ou dados de outros utilizadores</li>
          </ul>

          <h3 class="text-base font-bold text-primary">5. Conteúdo</h3>
          <p>Mantens a propriedade do conteúdo que publicas. Ao publicar, concedes ao EduLite uma licença para exibir o conteúdo dentro da plataforma.</p>

          <h3 class="text-base font-bold text-primary">6. Limitação de Responsabilidade</h3>
          <p>O EduLite é fornecido "tal como está". Não garantimos disponibilidade ininterrupta nem nos responsabilizamos por perda de dados.</p>

          <h3 class="text-base font-bold text-primary">7. Alterações</h3>
          <p>Reservamo-nos o direito de alterar estes termos. As alterações entram em vigor após publicação na plataforma.</p>
        </div>
      `
    }
  };

  // ── Open legal popup ──
  const openLegal = (type) => {
    const content = legalContent[type];
    if (!content) return;

    // Remove existing
    document.getElementById('legal-modal-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'legal-modal-overlay';
    overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-close></div>
      <div class="relative w-full max-w-lg max-h-[80vh] bg-surface dark:bg-[#0c1628] border border-border dark:border-white/10 rounded-2xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden" style="animation: legalFadeIn .25s ease">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border dark:border-white/10">
          <h2 class="text-lg font-bold text-primary">${content.title}</h2>
          <button data-close class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted hover:text-primary transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          ${content.body}
        </div>
        <!-- Footer -->
        <div class="px-6 py-3 border-t border-border dark:border-white/10 flex justify-end">
          <button data-close class="px-5 py-2 rounded-xl bg-neon text-black text-sm font-bold hover:opacity-90 transition-opacity">Entendido</button>
        </div>
      </div>
    `;

    // Inject animation keyframe if not present
    if (!document.getElementById('legal-modal-style')) {
      const style = document.createElement('style');
      style.id = 'legal-modal-style';
      style.textContent = `@keyframes legalFadeIn { from { opacity:0; transform:scale(.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`;
      document.head.appendChild(style);
    }

    // Close handlers
    overlay.querySelectorAll('[data-close]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .2s';
        setTimeout(() => overlay.remove(), 200);
      };
    });

    // Esc key
    const onKey = (e) => {
      if (e.key === 'Escape') {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .2s';
        setTimeout(() => overlay.remove(), 200);
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
  };

  // ── Attach click handlers ──
  footer.querySelectorAll('[data-legal]').forEach(btn => {
    btn.onclick = () => openLegal(btn.dataset.legal);
  });

  // ── Contact sidebar ──
  const openContact = () => {
    // Remove existing
    document.getElementById('contact-drawer-overlay')?.remove();
    document.getElementById('contact-drawer')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'contact-drawer-overlay';
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300';
    overlay.style.opacity = '0';

    const drawer = document.createElement('aside');
    drawer.id = 'contact-drawer';
    drawer.className = 'fixed top-0 right-0 h-full w-full max-w-[400px] bg-surface dark:bg-[#0c1628] shadow-2xl z-[201] flex flex-col border-l border-border dark:border-white/10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]';
    drawer.style.transform = 'translateX(100%)';
    drawer.innerHTML = `
      <div class="p-6 md:p-8 border-b border-border dark:border-white/5 flex justify-between items-center">
        <div>
          <h3 class="text-2xl font-black text-primary tracking-tight">Suporte EduLite</h3>
          <p class="text-sm text-neon font-bold uppercase tracking-wider mt-1">Estamos aqui para ajudar</p>
        </div>
        <button data-close-contact class="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-primary transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        <div class="space-y-4">
          <a href="mailto:support@edulite.app" class="w-full group p-4 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h4 class="font-bold text-primary text-lg">Email</h4>
              <p class="text-xs text-muted">Ideal para dúvidas complexas.</p>
            </div>
          </a>
        </div>
        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-black/5 dark:border-white/5"></div></div>
          <div class="relative flex justify-center"><span class="bg-surface dark:bg-[#0c1628] px-4 text-xs font-bold text-muted uppercase tracking-widest">Contactos Diretos</span></div>
        </div>
        <div class="space-y-4 text-sm text-muted">
          <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <svg class="w-5 h-5 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Lisboa, Portugal</span>
          </div>
        </div>
      </div>
      <div class="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center">
        <p class="text-[10px] text-muted/60">&copy; ${new Date().getFullYear()} EduLite</p>
      </div>
    `;

    const closeContact = () => {
      overlay.style.opacity = '0';
      drawer.style.transform = 'translateX(100%)';
      setTimeout(() => { overlay.remove(); drawer.remove(); }, 300);
    };

    overlay.onclick = closeContact;
    drawer.querySelector('[data-close-contact]').onclick = closeContact;

    const onKey = (e) => {
      if (e.key === 'Escape') { closeContact(); document.removeEventListener('keydown', onKey); }
    };
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      drawer.style.transform = 'translateX(0)';
    });
  };

  footer.querySelectorAll('[data-contact]').forEach(btn => {
    btn.onclick = () => openContact();
  });

  return footer;
}
