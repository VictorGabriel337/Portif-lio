// ===== Animações de entrada, sem biblioteca =====
//
// Antes isto usava GSAP + ScrollTrigger, baixados de um CDN (113 KB).
// O problema não era o peso: era a ORDEM. O HTML e o CSS chegavam e a
// página aparecia inteira; só então o GSAP terminava de baixar, rodava
// gsap.from() e ESCONDIA 21 elementos de uma vez, revelando-os de novo
// em seguida. No desktop esse intervalo era ~120 ms e ninguém via. No
// celular, com DNS + TLS + 113 KB de terceiro, virava segundos — e o
// conteúdo principal (h1, subtítulo, parágrafo, social icons) ficava
// esperando JavaScript de fora para simplesmente existir na tela.
//
// Agora o estado escondido mora no CSS e vale desde o primeiro paint,
// então não há mais o ciclo "aparece -> some -> volta". Quem revela é o
// IntersectionObserver, que o projeto já usa para os vídeos.
//
// Rede de segurança: o estado escondido só se aplica sob "html.js", e
// essa classe é posta por um script inline no <head>. Se o JavaScript
// falhar, nada nunca é escondido.

// --- Quem revela quem ---------------------------------------------------
// gatilho = o elemento observado; alvos = o que aparece quando ele entra.
// Observar o container (e não cada filho) preserva o efeito em cascata:
// os cards de uma seção entram juntos, escalonados, como era no GSAP.
//
// margem = a que altura da tela o gatilho dispara, em % (85 = quando o
// topo dele alcança 85% da altura da janela — o "top 85%" do ScrollTrigger).
// passo = atraso acumulado entre um alvo e o próximo, em segundos.
//
// A seção .home NÃO está nesta lista de propósito: ela é a primeira coisa
// que o usuário vê, então anima por CSS puro (@keyframes em styles.css),
// tocando já no primeiro frame. Conteúdo acima da dobra não deve depender
// de script nenhum para existir na tela.
const grupos = [
  { gatilho: ".servicos", alvos: ".servicos .titulo > *", passo: 0.15 },
  { gatilho: ".servicos .cards", alvos: ".servicos .card", passo: 0.12 },

  { gatilho: ".educacao", alvos: ".educacao > h2" },
  { gatilho: ".depoimentos", alvos: ".educacao .depoimento", margem: 80, passo: 0.2 },

  { gatilho: ".habilidades", alvos: ".habilidades > h2" },
  { gatilho: ".habilidades", alvos: ".skill-box" },
  { gatilho: ".skill-box", alvos: ".skill-box .fill", margem: 70, passo: 0.1 },
  { gatilho: ".skill-box", alvos: ".skill-box .tooltip", margem: 70, passo: 0.1 },

  { gatilho: ".experiencia", alvos: ".experiencia > h2" },
  { gatilho: ".experiencia", alvos: ".experiencia .empresas" },
  { gatilho: ".empresas-descricao", alvos: ".empresa-desc", passo: 0.15 },

  { gatilho: ".contato", alvos: ".contato > h2" },
  { gatilho: ".contato", alvos: ".contato-intro" },
  { gatilho: ".contato-grid", alvos: ".contato-card", passo: 0.12 },
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

// O escalonamento vira uma variável CSS por elemento: o CSS calcula o
// transition-delay a partir dela. Fazer isso aqui (e não no HTML) mantém
// o markup limpo, e é inofensivo se atrasar: o atraso só importa no
// momento da revelação, que também depende deste script.
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

  // Rede de segurança. O IntersectionObserver entrega os callbacks junto ao
  // ciclo de frames, então numa aba oculta (usuário abriu o link e trocou de
  // app, comportamento comuníssimo no celular) eles simplesmente não chegam.
  // Isso se resolve sozinho quando a aba volta a ficar visível, mas se por
  // qualquer motivo não resolver, nada some para sempre: passados 3 segundos,
  // tudo que ainda estiver escondido E dentro da tela é revelado na marra.
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
