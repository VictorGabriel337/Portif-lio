
const grupos = [
  { gatilho: ".servicos", alvos: ".servicos .titulo > *", passo: 0.18 },
  { gatilho: ".servicos .cards", alvos: ".servicos .card", passo: 0.15 },

  { gatilho: ".educacao", alvos: ".educacao > h2" },
  { gatilho: ".depoimentos", alvos: ".educacao .depoimento", margem: 80, passo: 0.24 },

  { gatilho: ".habilidades", alvos: ".habilidades > h2" },
  { gatilho: ".habilidades", alvos: ".skill-box" },
  { gatilho: ".skill-box", alvos: ".skill-box .fill", margem: 70, passo: 0.12 },
  { gatilho: ".skill-box", alvos: ".skill-box .tooltip", margem: 70, passo: 0.12 },

  { gatilho: ".experiencia", alvos: ".experiencia > h2" },
  { gatilho: ".experiencia", alvos: ".experiencia .empresas" },
  { gatilho: ".empresas-descricao", alvos: ".empresa-desc", passo: 0.18 },

  { gatilho: ".contato", alvos: ".contato > h2" },
  { gatilho: ".contato", alvos: ".contato-intro" },
  { gatilho: ".contato-grid", alvos: ".contato-card", passo: 0.15 },
  { gatilho: ".contato", alvos: ".contato > .btn" },
];

// Resolve cada grupo em elementos reais, ignorando o que não existir.
const montados = grupos
  .map((g) => ({
    gatilho: document.querySelector(g.gatilho),
    alvos: [...document.querySelectorAll(g.alvos)],
    margem: g.margem ?? 85,
    passo: g.passo ?? 0,
  }))
  .filter((g) => g.gatilho && g.alvos.length);


montados.forEach((g) =>
  g.alvos.forEach((el, i) => {
    if (g.passo) {
      el.style.setProperty("--i", i);
      el.style.setProperty("--passo", g.passo + "s");
    }
  })
);

const mostrar = (alvos) => alvos.forEach((el) => el.classList.add("visivel"));
const esconder = (alvos) => alvos.forEach((el) => el.classList.remove("visivel"));

// Quem pediu menos movimento vê tudo na hora, sem transição.
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("sem-animacao");
  montados.forEach((g) => mostrar(g.alvos));
} else if (!("IntersectionObserver" in window)) {
  // Navegador muito antigo: melhor tudo visível do que nada.
  montados.forEach((g) => mostrar(g.alvos));
} else {
  montados.forEach((g) => {
    // rootMargin negativo embaixo encolhe a área de disparo: com margem 85,
    // o gatilho só conta como visível quando entra nos 85% de cima da tela.
    const observador = new IntersectionObserver(
      ([entrada]) => (entrada.isIntersecting ? mostrar : esconder)(g.alvos),
      { rootMargin: `0px 0px -${100 - g.margem}% 0px` }
    );
    observador.observe(g.gatilho);
  });


  const destravar = () => {
    montados.forEach((g) => {
      const r = g.gatilho.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) mostrar(g.alvos);
    });
  };
  setTimeout(destravar, 3000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) setTimeout(destravar, 300);
  });
}
