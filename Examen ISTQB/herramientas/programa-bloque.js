/* Bloque «📖 Ver en el programa»: texto oficial del programa CTFL v4.0 (ES) bajo cada corrección.
   Script clásico (sin export). Lee el global PROGRAMA = { apartados, glosario, diferencias } y usa esc() del aula. */

const PROG_COPY = "© ISTQB® · Traducción oficial SSTQB del programa CTFL v4.0 · Uso personal de estudio";

// Negrita sobre texto ya escapado
function mdInline(s){ return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }

// Markdown del programa → HTML. Escapa antes de convertir (nada de HTML crudo del texto).
function mdAHtml(md){
  const lineas = String(md == null ? "" : md).split("\n");
  const out = [];
  let i = 0;
  while (i < lineas.length){
    const l = lineas[i];
    if (!l.trim()){ i++; continue; }
    // Tabla
    if (/^\s*\|/.test(l)){
      const filas = [];
      while (i < lineas.length && /^\s*\|/.test(lineas[i])){ filas.push(lineas[i]); i++; }
      const celdas = f => f.trim().replace(/^\||\|$/g, "").split("|").map(c => mdInline(esc(c.trim())));
      const datos = filas.filter(f => !/^\s*\|[\s:|-]+\|?\s*$/.test(f));
      let h = "<table>";
      datos.forEach((f, k) => {
        const tag = k === 0 && datos.length > 1 ? "th" : "td";
        h += "<tr>" + celdas(f).map(c => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
      });
      out.push(h + "</table>");
      continue;
    }
    // Lista con anidado por sangría (2 espacios por nivel)
    if (/^\s*- /.test(l)){
      let h = "", nivel = -1;
      while (i < lineas.length && /^\s*- /.test(lineas[i])){
        const m = lineas[i].match(/^(\s*)- (.*)$/);
        const n = Math.floor(m[1].length / 2);
        if (nivel === -1){ h += "<ul><li>"; nivel = 0; }
        else if (n > nivel){ h += "<ul><li>"; nivel++; }
        else {
          h += "</li>";
          while (nivel > n){ h += "</ul></li>"; nivel--; }
          h += "<li>";
        }
        h += mdInline(esc(m[2]));
        i++;
      }
      while (nivel > 0){ h += "</li></ul>"; nivel--; }
      out.push(h + "</li></ul>");
      continue;
    }
    // Encabezado de apartado hijo
    const enc = l.match(/^###\s+(.*)$/);
    if (enc){ out.push(`<h4 class="prog-h">${mdInline(esc(enc[1]))}</h4>`); i++; continue; }
    // Nota al pie: «> N texto»
    const nota = l.match(/^>\s?(.*)$/);
    if (nota){ out.push(`<p class="nota">${mdInline(esc(nota[1]))}</p>`); i++; continue; }
    // Figura
    if (/^\[Figura:/.test(l.trim())){ out.push(`<p class="fig">${esc(l.trim())}</p>`); i++; continue; }
    // Párrafo: líneas seguidas hasta hueco u otro bloque
    const p = [];
    while (i < lineas.length && lineas[i].trim() && !/^\s*(\||- |###|>|\[Figura:)/.test(lineas[i])){ p.push(lineas[i].trim()); i++; }
    if (!p.length){ p.push(l.trim()); i++; }
    out.push("<p>" + mdInline(esc(p.join(" "))) + "</p>");
  }
  return out.join("");
}

function progApartado(id){ return PROGRAMA.apartados.find(a => a.id === id); }

// Apartado + todos sus descendientes en orden; cada hijo precedido de «### id título»
function apartadoCompleto(id){
  const a = progApartado(id);
  if (!a) return "";
  const partes = [a.texto || ""];
  (function rec(padre){
    PROGRAMA.apartados.filter(x => x.padre === padre).forEach(h => {
      partes.push(`### ${h.id} ${h.titulo}`, h.texto || "");
      rec(h.id);
    });
  })(id);
  return partes.filter(Boolean).join("\n\n");
}

// «Cap. 1 Título › 1.4 Título › 1.4.2 Título»
function rutaDe(id){
  const cadena = [];
  for (let a = progApartado(id); a; a = a.padre ? progApartado(a.padre) : null) cadena.unshift(a);
  return cadena.map(a => (a.padre ? a.id : "Cap. " + a.id) + " " + a.titulo).join(" › ");
}

// Plural de la primera palabra: vocal +s, consonante +es, -ión → -iones; las acabadas en s no cambian
function progPlural(p){
  if (/ión$/i.test(p)) return p.slice(0, -3) + "iones";
  if (/[aeiouáéíóú]$/i.test(p)) return p + "s";
  if (/s$/i.test(p)) return p;
  return p + "es";
}

let _progMapa = null, _progRe = null;
function progPrepararTerminos(){
  if (_progMapa) return;
  _progMapa = new Map();
  const gl = PROGRAMA.glosario || [];
  const poner = (f, k) => { const c = f.toLowerCase(); if (c && !_progMapa.has(c)) _progMapa.set(c, k); };
  gl.forEach((t, k) => { poner(t.es, k); (t.variantes || []).forEach(v => poner(v, k)); });
  gl.forEach((t, k) => {
    [t.es, ...(t.variantes || [])].forEach(f => {
      const [p, ...resto] = f.split(" ");
      poner([progPlural(p), ...resto].join(" "), k);
    });
  });
  const formas = [..._progMapa.keys()].sort((a, b) => b.length - a.length)
    .map(f => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Palabra completa con letras españolas: lookarounds sobre \p{L}\p{N} (\b no sirve con acentos)
  _progRe = formas.length ? new RegExp("(?<![\\p{L}\\p{N}])(?:" + formas.join("|") + ")(?![\\p{L}\\p{N}])", "giu") : null;
}

// Envuelve términos del glosario en <span class="term">. Solo texto (no etiquetas), nunca dentro de otro .term;
// solo la primera aparición de cada término en el HTML recibido.
function marcarTerminos(html){
  progPrepararTerminos();
  if (!_progRe) return html;
  const vistos = new Set();
  let dentro = 0, enTitulo = 0;
  return String(html).split(/(<[^>]*>)/).map(seg => {
    if (seg[0] === "<"){
      if (/^<h[1-6]\b/i.test(seg)) enTitulo++;
      else if (/^<\/h[1-6]>/i.test(seg)) enTitulo = Math.max(0, enTitulo - 1);
      if (/^<span\b[^>]*class="[^"]*\bterm\b/.test(seg)) dentro++;
      else if (dentro && /^<span\b/.test(seg)) dentro++;
      else if (dentro && /^<\/span>/.test(seg)) dentro--;
      return seg;
    }
    // Ni dentro de otro término ni en títulos (gastarían el único hueco del término)
    if (dentro || enTitulo) return seg;
    return seg.replace(_progRe, m => {
      const k = _progMapa.get(m.toLowerCase());
      if (k === undefined || vistos.has(k)) return m;
      vistos.add(k);
      return `<span class="term" data-t="${k}">${m}</span>`;
    });
  }).join("");
}

// Avisos: id igual, descendiente, o ancestro que no sea capítulo. Los de capítulo (sin punto) nunca.
function progAvisos(f){
  return (PROGRAMA.diferencias || []).filter(e =>
    e.id.includes(".") && (e.id === f || e.id.startsWith(f + ".") || f.startsWith(e.id + ".")));
}

function programaHTML(fuente){
  if (!fuente || !progApartado(fuente)) return "";
  const txt = marcarTerminos(mdAHtml(apartadoCompleto(fuente)));
  const avisos = progAvisos(fuente).map(e => {
    const pre = e.tipo === "traducción" ? "⚠️ Error de traducción: " : "⚠️ Actualizado en v4.0.1: ";
    return `<div class="prog-aviso"><div>${esc(pre + e.resumen)}</div>` +
      `<small><b>ES:</b> ${esc(e.es)}<br><b>EN:</b> ${esc(e.en)}<br><b>EN en español:</b> ${esc(e.en_es)}</small></div>`;
  }).join("");
  return `<details class="prog"><summary>📖 Ver en el programa (${esc(fuente)})</summary><div class="prog-in">` +
    `<div class="prog-ruta">${esc(rutaDe(fuente))}</div>` +
    `<div class="prog-txt">${txt}</div>` +
    (avisos ? `<div class="prog-avisos">${avisos}</div>` : "") +
    `<div class="prog-copy">${esc(PROG_COPY)}</div></div></details>`;
}

// Clic delegado en document, registrado una sola vez: abre/cierra el recuadro de definición del término
function activarTerminos(){
  if (window.__progTerm) return;
  window.__progTerm = true;
  document.addEventListener("click", ev => {
    const t = ev.target && ev.target.closest ? ev.target.closest(".term") : null;
    if (ev.target && ev.target.closest && ev.target.closest(".term-pop")) return;
    const previo = document.querySelector(".term-pop");
    const eraEste = previo && previo.__term === t;
    if (previo) previo.remove();
    if (!t || eraEste) return;
    const g = PROGRAMA.glosario[+t.dataset.t];
    const cont = t.closest(".prog-in");
    if (!g || !cont) return;
    const url = (String(g.fuente || "").match(/https?:\/\/\S+/) || [])[0];
    const pop = document.createElement("div");
    pop.className = "term-pop";
    pop.__term = t;
    pop.innerHTML = `<b>${esc(g.es)}</b> <i>${esc(g.en)}</i><div>${esc(g.definicion)}</div>` +
      (url
        ? `<small><a href="${esc(url)}" target="_blank" rel="noopener">${esc(g.fuente.replace(url, "").replace(/[\s·]+$/, "") || "fuente")}</a></small>`
        : `<small>${esc(g.fuente || "")}</small>`);
    cont.appendChild(pop);
    // Posición relativa al contenedor con getBoundingClientRect (offsetTop/Left van contra el offsetParent: dentro de un <td> sería la celda)
    const rt = t.getBoundingClientRect(), rc = cont.getBoundingClientRect();
    pop.style.top = (rt.bottom - rc.top - cont.clientTop + cont.scrollTop + 4) + "px";
    pop.style.left = Math.max(0, Math.min(rt.left - rc.left - cont.clientLeft + cont.scrollLeft, cont.clientWidth - pop.offsetWidth)) + "px";
  });
}
