// ===== Menu ativo conforme a rolagem =====

// Pega todos os links do nav (o logo fica de fora, pois esta fora da tag <nav>)
const links = document.querySelectorAll("nav a");

// Para cada link, pega a seção correspondente ao seu href (#home -> <section id="home">)
const secoes = [...links].map((link) =>
  document.querySelector(link.getAttribute("href"))
);

// Altura aproximada do header fixo. É a "linha imaginária" logo abaixo dele:
// a seção que estiver cruzando essa linha é a seção atual.
const LINHA_DE_ATIVACAO = 150;

function distanciaDoTopo(elemento) {
  return elemento.getBoundingClientRect().top + window.scrollY;
}

function atualizarMenu() {
  const posicao = window.scrollY + LINHA_DE_ATIVACAO;

  // Percorre as seções de cima para baixo e guarda a última que ja passou da linha
  let atual = secoes[0];
  for (const secao of secoes) {
    if (distanciaDoTopo(secao) <= posicao) atual = secao;
  }

  // Se chegou no fim da página, força a última seção (senão "Contato" nunca acende)
  const fimDaPagina =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2;
  if (fimDaPagina) atual = secoes[secoes.length - 1];

  // Liga a classe .active no link certo e desliga em todos os outros
  links.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + atual.id);
  });
}

window.addEventListener("scroll", atualizarMenu, { passive: true });
window.addEventListener("resize", atualizarMenu);
atualizarMenu(); // roda uma vez ao abrir a página

// ===== Menu hamburguer (telas pequenas) =====

const botaoMenu = document.querySelector("#menu-icon");
const nav = document.querySelector("#nav");

function abrirFecharMenu(abrir) {
  // Se nao disserem se é para abrir ou fechar, inverte o estado atual
  const aberto = abrir === undefined ? !nav.classList.contains("active") : abrir;

  nav.classList.toggle("active", aberto);
  botaoMenu.setAttribute("aria-expanded", aberto);
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  // Troca o ícone: 3 tracinhos <-> X. Os dois desenhos ja estao no sprite
  // do topo do body; basta apontar o <use> para o outro.
  botaoMenu
    .querySelector("use")
    .setAttribute("href", aberto ? "#i-xmark" : "#i-bars");
}

botaoMenu.addEventListener("click", () => abrirFecharMenu());

// Clicou em um link do menu? Rola até a seção e fecha o menu.
links.forEach((link) => link.addEventListener("click", () => abrirFecharMenu(false)));

// Clicou fora do menu aberto? Fecha também.
document.addEventListener("click", (evento) => {
  const clicouDentro = nav.contains(evento.target) || botaoMenu.contains(evento.target);
  if (!clicouDentro) abrirFecharMenu(false);
});

// Voltou para uma tela grande com o menu aberto? Limpa o estado.
window.addEventListener("resize", () => {
  if (window.innerWidth > 995) abrirFecharMenu(false);
});

// ===== Vídeos sob demanda =====
//
// Os 6 vídeos somam MUITOS megabytes. Com "autoplay" o navegador começava a
// baixar todos assim que a página abria, mesmo os que ninguém ia ver.
//
// Aqui eles ficam com preload="none" e sem src. O src (guardado em data-src)
// só é aplicado quando o card entra na tela — e o vídeo pausa ao sair, para
// não gastar processador/bateria rodando fora de vista.

const videos = document.querySelectorAll("video[data-src]");

// Respeita quem pediu menos animação ou está economizando dados do celular.
const conexao = navigator.connection || {};
const pouparDados =
  conexao.saveData === true ||
  /2g/.test(conexao.effectiveType || "") ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!videos.length) {
  // nada a fazer
} else if (pouparDados || !("IntersectionObserver" in window)) {
  // Sem vídeo: mostra só o poster (leve). O card continua ilustrado.
  videos.forEach((v) => {
    if (v.dataset.poster) v.poster = v.dataset.poster;
  });
} else {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        const video = entrada.target;

        if (!entrada.isIntersecting) {
          if (!video.paused) video.pause();
          return;
        }

        // Primeira vez que aparece: aí sim começa o download.
        // O poster vem primeiro (é leve e aparece na hora); o vídeo,
        // bem mais pesado, chega logo atrás e cobre o poster.
        if (!video.src) {
          if (video.dataset.poster) video.poster = video.dataset.poster;
          video.src = video.dataset.src;
          video.load();
        }
        // play() devolve uma Promise que rejeita se o navegador bloquear.
        // Sem o catch, isso vira erro vermelho no console.
        const p = video.play();
        if (p) p.catch(() => {});
      });
    },
    {
      // Começa a carregar 200px ANTES do card aparecer, para que o vídeo
      // já esteja rodando quando o usuário chegar nele.
      rootMargin: "200px 0px",
      threshold: 0.1,
    }
  );

  videos.forEach((v) => observador.observe(v));
}
