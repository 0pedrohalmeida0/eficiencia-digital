// Bilingual toggle
    (function () {
      const root = document.documentElement;
      const btn = document.getElementById('lang-toggle');
      const btnM = document.getElementById('lang-toggle-mobile');
      const stored = localStorage.getItem('lang') || 'pt';
      const setLang = (l) => {
        root.setAttribute('data-lang', l);
        root.setAttribute('lang', l === 'pt' ? 'pt-BR' : 'en');
        localStorage.setItem('lang', l);
        if (btn) btn.textContent = l === 'pt' ? 'PT / EN' : 'EN / PT';
        if (btnM) btnM.textContent = l === 'pt' ? 'PT / EN' : 'EN / PT';
      };
      setLang(stored);
      const handler = () => setLang(root.getAttribute('data-lang') === 'pt' ? 'en' : 'pt');
      if (btn) btn.addEventListener('click', handler);
      if (btnM) btnM.addEventListener('click', handler);
    })();

    // Mobile menu
    (function () {
      const btn = document.getElementById('menu-btn');
      const menu = document.getElementById('mobile-menu');
      if (!btn || !menu) return;
      btn.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }));
    })();

    // Reveal on scroll
    (function () {
      const items = document.querySelectorAll('.reveal');
      if (!items.length) return;
      if (!('IntersectionObserver' in window)) {
        items.forEach(i => i.classList.add('in'));
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
      items.forEach(i => io.observe(i));
      setTimeout(() => items.forEach(i => i.classList.add('in')), 1200);
    })();

    // Form submit
    (function () {
      const form = document.getElementById('contact-form');
      const status = document.getElementById('form-status');
      if (!form) return;
      const sendingText = { pt: 'Enviando…', en: 'Sending…' };
      const sendText = { pt: 'Enviar mensagem', en: 'Send message' };
      const okText = { pt: '✓ Mensagem enviada. Retorno em até 24h.', en: '✓ Message sent. I reply within 24h.' };
      const errText = { pt: 'Não consegui enviar. Me chama no WhatsApp: (51) 99180-3676', en: "Couldn't send. Reach me on WhatsApp: (51) 99180-3676" };
      const currentLang = () => document.documentElement.getAttribute('data-lang') || 'pt';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const data = new FormData(form);
        btn.disabled = true;
        btn.innerHTML = sendingText[currentLang()];
        try {
          const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
          if (res.ok) { status.className = 'ok'; status.textContent = okText[currentLang()]; form.reset(); }
          else throw new Error('Falha');
        } catch (err) { status.className = 'err'; status.textContent = errText[currentLang()]; }
        finally {
          btn.disabled = false;
          btn.innerHTML = sendText[currentLang()] + ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
        }
      });
    })();


// =============================================
// Console banner pessoal
// =============================================
(function () {
  // Helper: cria string de estilo CSS pro %c
  const c = (color, bg = 'transparent', weight = '600', size = '13px') =>
    `color: ${color}; background: ${bg}; padding: 3px 9px; border-radius: 5px; font-weight: ${weight}; font-size: ${size};`;
  const sep = () => console.log('%c' + '─'.repeat(62), 'color: #10b981; font-weight: 300;');
  const r = (txt, color, bg, w) => console.log('%c' + txt, c(color, bg, w));
  const w = (txt, weight = '500') => console.log('%c' + txt, `color: #14171e; font-weight: ${weight}; font-size: 13px;`);

  // Espaço inicial
  console.log('%c', 'padding: 6px 0;');

  // Header com nome + role
  r('  Pedro Henrique de Almeida  ', '#ffffff', '#14171e', '700');
  r('  Full Stack Python Developer  ', '#047857', '#d1fae5', '600');
  sep();

  // Pitch
  w('   ✦ Sistemas sob medida · não templates');
  w('   ✦ Da landing page ao ERP · tudo calibrado pra você');
  sep();

  // Canais de contato
  r(' → GitHub   ', '#ffffff', '#1e293b', '600'); w('  github.com/0pedrohalmeida0');
  r(' → LinkedIn ', '#ffffff', '#0077b5', '600'); w('  in/pedrohenriquedealmeida3');
  r(' → WhatsApp ', '#ffffff', '#25d366', '600'); w('  (51) 99180-3676');
  r(' → E-mail   ', '#ffffff', '#0ea5e9', '600'); w('  phdealmeida3@gmail.com');
  sep();

  // Dica interativa
  r(' 💡 Dica  ', '#92400e', '#fef3c7', '700'); w('  digite  pedro.hire()  pra começar', '500');
  console.log('%c', 'padding: 6px 0;');

  // Easter egg: objeto global 'pedro' com stats reais
  window.pedro = {
    name: 'Pedro Henrique de Almeida',
    role: 'Full Stack Python Developer',
    location: 'Rio Grande do Sul · Brasil',
    stack: ['Python', 'Django', 'Flask', 'FastAPI', 'React 18', 'PostgreSQL', 'Supabase'],
    projects: 7,
    tests: 123,
    available: true,
    hire() {
      console.log('%c✓ Vamos conversar!', 'color: #047857; font-weight: 700; font-size: 14px;');
      console.log('%c → WhatsApp: https://wa.me/5551991803676', 'color: #25d366; font-weight: 600;');
      console.log('%c → E-mail:   phdealmeida3@gmail.com', 'color: #0ea5e9; font-weight: 600;');
      return 'Aceitando projetos';
    }
  };
})();
