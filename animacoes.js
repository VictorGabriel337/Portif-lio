// ===== Animações com GSAP + ScrollTrigger =====
// Regra geral: NADA anima no carregamento da página.
// Cada animação só dispara quando a seção dela entra na tela,
// e REPETE toda vez que a seção sai e volta.

// --- Rede de segurança -------------------------------------------------
// Se o GSAP não carregar (sem internet, CDN fora do ar), as barras de skill
// ficariam vazias para sempre. Aqui preenchemos elas na mão e paramos por aqui.
function mostrarTudoSemAnimacao() {
  document.querySelectorAll(".fill").forEach((barra) => {
    barra.style.width = getComputedStyle(barra).getPropertyValue("--w").trim();
  });
  document.querySelectorAll(".tooltip").forEach((t) => (t.style.opacity = 1));
}

const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || semMovimento) {
  mostrarTudoSemAnimacao();
} else {
  iniciarAnimacoes();
}

// ----------------------------------------------------------------------
function iniciarAnimacoes() {
  gsap.registerPlugin(ScrollTrigger);

  // Configuração que vale para TODAS as animações daqui para baixo.
  ScrollTrigger.defaults({
    // Dispara quando o topo do elemento chega a 85% da altura da tela
    // (ou seja, quando ele está entrando pela parte de baixo).
    start: "top 85%",
    // "Fim" = quando a base do elemento passa do topo da tela,
    // isto é, quando ele sumiu completamente por cima.
    end: "bottom top",

    // A ordem é sempre: [descendo entra] [descendo sai] [subindo entra] [subindo sai]
    //   restart -> toca a animação do zero
    //   reset   -> volta ao estado escondido, sem animar (acontece fora da tela)
    //   reverse -> toca a animação de tras para frente (saída suave)
    toggleActions: "restart reset restart reverse",
  });

  // Atalho: "aparecer subindo".
  // clearProps: "all" => ao terminar, o GSAP apaga os estilos inline que criou,
  // devolvendo o elemento ao CSS original (importante para os :hover funcionarem).
  function revelar(alvo, extras = {}) {
    const { gatilho, ...opcoes } = extras;
    return gsap.from(alvo, {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: "power3.out",
      clearProps: "all",
      scrollTrigger: { trigger: gatilho || alvo },
      ...opcoes,
    });
  }

  // --- HOME ---
  // A home já está na posição certa quando a página abre, então ela toca de imediato.
  gsap.from(".home-img img", {
    opacity: 0,
    scale: 0.85,
    duration: 1.2,
    ease: "power3.out",
    clearProps: "all",
    scrollTrigger: { trigger: ".home", start: "top 80%" },
  });

  gsap.from(".home-content > *", {
    opacity: 0,
    x: -60,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.15,
    clearProps: "all",
    scrollTrigger: { trigger: ".home", start: "top 80%" },
  });

  // --- SERVIÇOS ---
  revelar(".servicos .titulo > *", { stagger: 0.15, gatilho: ".servicos" });

  gsap.from(".servicos .card", {
    opacity: 0,
    y: 80,
    scale: 0.92,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.12, // cada card entra 0.12s depois do anterior
    clearProps: "all",
    scrollTrigger: { trigger: ".servicos .cards" },
  });

  // --- EDUCAÇÃO ---
  revelar(".educacao > h2");
  gsap.from(".educacao .depoimento", {
    opacity: 0,
    y: 70,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.2,
    clearProps: "all",
    scrollTrigger: { trigger: ".depoimentos", start: "top 80%" },
  });

  // --- HABILIDADES ---
  revelar(".habilidades > h2");
  revelar(".skill-box", { y: 50 });

  // As barras: a largura final está no CSS de cada uma, na variável --w.
  // A função (i, el) => ... pega esse valor de cada barra individualmente.
  gsap.fromTo(
    ".skill-box .fill",
    { width: 0 },
    {
      width: (i, el) => getComputedStyle(el).getPropertyValue("--w").trim(),
      duration: 1.4,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".skill-box", start: "top 70%" },
    }
  );

  // Os tooltips (95%, 90%...) aparecem depois, com a barra já cheia.
  gsap.fromTo(
    ".skill-box .tooltip",
    { opacity: 0, y: 0 },
    {
      opacity: 1,
      y: -5,
      duration: 0.4,
      stagger: 0.1,
      delay: 0.9,
      scrollTrigger: { trigger: ".skill-box", start: "top 70%" },
    }
  );

  // --- EXPERIÊNCIA ---
  revelar(".experiencia > h2");
  revelar(".empresas", { y: 40 });
  gsap.from(".empresa-desc", {
    opacity: 0,
    y: 60,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.15,
    clearProps: "all",
    scrollTrigger: { trigger: ".empresas-descricao" },
  });

  // --- CONTATO ---
  revelar(".contato > h2");
  revelar(".contato-intro");
  gsap.from(".contato-card", {
    opacity: 0,
    y: 60,
    scale: 0.95,
    duration: 0.7,
    ease: "back.out(1.4)", // passa um pouquinho do ponto e volta
    stagger: 0.12,
    clearProps: "all",
    scrollTrigger: { trigger: ".contato-grid" },
  });
  revelar(".contato > .btn", { y: 30 });

  // A fonte (Poppins) chega depois do CSS e muda a altura dos textos, deslocando
  // as seções. Se isso acontecer depois que o ScrollTrigger já calculou as
  // posições, os gatilhos ficam presos em lugares antigos e disparam na hora
  // errada (o bug intermitente: depende de quando a fonte carrega). Recalcula
  // assim que a fonte estiver pronta.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  // Depois que tudo (imagens, vídeos) terminar de carregar, os elementos podem
  // ter mudado de altura. Isso manda o ScrollTrigger recalcular as posições.
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
