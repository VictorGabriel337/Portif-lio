# Portfólio — Victor Gabriel

Site estático: HTML, CSS e JavaScript puro, sem build. É só subir os arquivos.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | a página inteira |
| `styles.css` | estilos e responsividade |
| `icones.css` | os 15 ícones, como máscaras SVG embutidas |
| `script.js` | menu ativo, menu hambúrguer e carregamento dos vídeos sob demanda |
| `animacoes.js` | animações de entrada (GSAP + ScrollTrigger) |
| `img/`, `video/`, `eu*.webp` | mídia |

Não publicar: `_originais/`, `_video_originais/` e `otimizar-videos.ps1`
(já listados no `.gitignore`).

## Como o carregamento foi montado

A página baixa **~190 KB** e **nenhum byte de vídeo** ao abrir.

- Os `<video>` não têm `autoplay` nem `src`. O endereço fica em `data-src` e o
  `IntersectionObserver` em `script.js` só o aplica quando o card chega a 200px
  da tela — pausando o vídeo quando ele sai de vista.
- Cada card tem um `poster` (frame do próprio vídeo, ~20 KB), também sob demanda.
- Quem estiver em modo de economia de dados ou com `prefers-reduced-motion` vê
  só o poster, sem baixar vídeo nenhum.
- A foto da home usa `srcset`: o celular baixa 17 KB em vez de 69 KB.

Se você trocar ou adicionar um vídeo, **rode o `otimizar-videos.ps1`** antes de
publicar (precisa do ffmpeg: `winget install Gyan.FFmpeg`). Ele reduz para 960px,
remove o áudio e aplica `faststart`.

## Configuração do servidor

Três ajustes que valem mais que qualquer otimização de código:

**1. Ativar gzip ou brotli.** Os arquivos de texto encolhem muito:

| Arquivo | Cru | Comprimido |
|---|---|---|
| `icones.css` | 27 KB | ~6 KB |
| `styles.css` | 18 KB | ~4 KB |
| `index.html` | 18 KB | ~4 KB |

**2. Cache longo para a mídia**, que não muda:

```
Cache-Control: public, max-age=31536000, immutable
```
para `video/`, `img/` e `*.webp`. Para `index.html`, use cache curto ou
`no-cache`, senão as atualizações demoram a aparecer.

**3. Range requests nos `.mp4`.** É o que permite ao navegador transmitir o vídeo
aos poucos em vez de baixar o arquivo inteiro. Apache, Nginx e GitHub Pages já
fazem isso por padrão; se você usar um servidor próprio, confirme que ele
responde `Accept-Ranges: bytes`.

## Rodar localmente

```
python -m http.server 8080
```
e abrir `http://localhost:8080/`.

Abrir o `index.html` direto pelo `file://` **não funciona direito** — os vídeos e
o `IntersectionObserver` dependem de HTTP.
