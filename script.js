// ════════════════════════════════════════════════════════════════
//  CLASSE PHASE — Abstração para cada fase do jogo
// ════════════════════════════════════════════════════════════════
class Phase {
  constructor(config) {
    this.id           = config.id;
    this.name         = config.name;
    this.icon         = config.icon;
    this.objective    = config.objective;
    this.hint         = config.hint;
    this.setDisplay   = config.setDisplay || 'A = {1, 2, 3, 4}';
    this.size         = config.size || 4;
    this.setA         = config.setA || [1, 2, 3, 4];
    this.initialActive = config.initialActive || [];
    this.locked       = config.locked || [];
    this.answers      = config.answers || null;
    this._classes     = config._classes || null;
    this._R           = config._R || null;
    this._S           = config._S || null;
    this._expected    = config._expected || null;
    // bind para garantir que 'this' dentro de check/highlight aponta para a instância
    this.check        = (config.check || (() => ({ ok: true, msg: '' }))).bind(this);
    this.highlight    = (config.highlight || (() => {})).bind(this);
  }
}


// ═══════════════════════════════════════════════════════════════════
//  NARRATIVA — Operação Nó Górdio
//  Frota Aliada vs Armada GAR
//  Willy: navegador veterano, bem-humorado, fuma cachimbo
// ═══════════════════════════════════════════════════════════════════

// Sprites do Willy (base64 PNG — 4 frames de animação)
const WILLY_SPRITES = {
  f1: "assets/marinheiro_1.png",
  f2: "assets/marinheiro_2.png",
  f3: "assets/marinheiro_3.png",
  f4: "assets/marinheiro_4.png",
};

// ── Tela de introdução: slides narrativos ──────────────────────
const INTRO_SLIDES = [
  {
    img: null,
    title: "ANO 2187. MAR DE KAMINO.",
    text: "A Armada GAR domina os oceanos há décadas usando um sistema de comunicação impossível de interceptar... até hoje.",
  },
  {
    img: null,
    title: "OPERAÇÃO NÓ GÓRDIO",
    text: "Inteligência aliada descobriu que as frotas inimigas se comunicam através de PADRÕES MATEMÁTICOS — relações codificadas entre as naves.",
  },
  {
    img: null,
    title: "SUA MISSÃO",
    text: "Decifre os 10 padrões de comunicação da Armada GAR. Cada padrão revelado aproxima você das coordenadas do quartel-general inimigo.",
  },
  {
    willy: true,
    text: "Ah, bom ver um rosto novo no convés! Sou o Willy, navegador desta embarcação faz uns... bom, faz tempo. Eu sei ler esses padrões como leio o vento. Me acompanhe!",
    mood: 'talk',
  },
  {
    willy: true,
    text: "Cada padrão que a GAR transmite é uma RELAÇÃO — um conjunto de pares de naves que se comunicam. Decifre a estrutura desse conjunto e a GARen não tem como se esconder!",
    mood: 'talk',
  },
];

// ── Diálogos do Willy por fase ─────────────────────────────────
// mood: 'idle' | 'talk' | 'blink' | 'happy'
// Cada fase tem: intro (array de falas), success (fala), fail (fala)
const WILLY_DIALOGS = {

  // FASE 1
  reflexive: {
    intro: [
      { text: "Primeiro sinal interceptado! Simples, mas instrutivo.", mood: 'talk' },
      { text: "As naves GAR neste padrão só se comunicam consigo mesmas. Isso é o que chamamos de RELAÇÃO REFLEXIVA — todo elemento se relaciona com ele mesmo. Marque a diagonal toda!", mood: 'talk' },
      { text: "Ah, e não marque nada fora da diagonal — eu conheço esses padrões, e este aqui é só a diagonal. Seja preciso como um bom nó de marinheiro!", mood: 'talk' },
    ],
    success: { text: "Excelente! Diagonal completa — padrão reflexivo decifrado! A GAR não sabe que estamos lendo o correio dela. Heheheh!", mood: 'happy' },
    fail:    { text: "Quase lá, marujo. Ou sobrou coisa fora da diagonal, ou faltou um par. Pense: TODA nave deve se comunicar com ela mesma, e só isso.", mood: 'blink' },
  },

  // FASE 2
  symmetric: {
    intro: [
      { text: "Segundo sinal! Este é mais interessante...", mood: 'talk' },
      { text: "As naves fixas já estão marcadas — mas parece que o rádio delas só funciona em mão única! Para o padrão ser SIMÉTRICO, se a Nave A fala com B, então B precisa falar com A também.", mood: 'talk' },
      { text: "Encontre todos os pares sem espelho e complete. Num bom navio, a comunicação é sempre de ida e volta!", mood: 'idle' },
    ],
    success: { text: "Ótimo trabalho! Todos os sinais têm resposta — padrão simétrico confirmado! Mais um segredo da GAR revelado.", mood: 'happy' },
    fail:    { text: "Hmm, ainda tem nave falando sem receber resposta. Olhe cada par ativo: o espelho dele também está marcado? Se (a,b) existe, (b,a) tem que existir!", mood: 'blink' },
  },

  // FASE 3
  transitive: {
    intro: [
      { text: "Terceiro sinal — agora as coisas ficam interessantes de verdade.", mood: 'talk' },
      { text: "A GAR usa mensagens em cadeia: Nave A fala com B, B fala com C... e então A fala diretamente com C. Isso é TRANSITIVIDADE. Feche todas as cadeias!", mood: 'talk' },
      { text: "Cuidado: fechar uma cadeia pode criar NOVAS cadeias que também precisam ser fechadas. É como um nó que puxa outros nós!", mood: 'idle' },
    ],
    success: { text: "Perfeito! Todas as cadeias estão fechadas! Esses padrões transitivos são a espinha dorsal da comunicação GAR. Estamos chegando perto deles!", mood: 'happy' },
    fail:    { text: "Ainda tem cadeia aberta por aí. Procure dois pares onde o segundo elemento de um é o primeiro do outro — o resultado dessa cadeia precisa estar marcado!", mood: 'blink' },
  },

  // FASE 4
  classify: {
    intro: [
      { text: "Quarto sinal — agora preciso da sua ANÁLISE, não só do seu clique.", mood: 'talk' },
      { text: "O padrão já está fixo no tabuleiro. Sua missão é classificar: este padrão é reflexivo? Simétrico? Transitivo? De equivalência? Olhe com calma — tem uma pegadinha!", mood: 'talk' },
      { text: "Dica de velho marinheiro: procure um par (a,b) e veja se (b,a) existe. Depois procure duas naves em cadeia e veja se o atalho existe. Não se apresse!", mood: 'idle' },
    ],
    success: { text: "Análise certeira! Você tem olho aguçado para esses padrões. A GAR vai se arrepender de ter subestimado nossa inteligência!", mood: 'happy' },
    fail:    { text: "Quase, mas não. Revise cada propriedade com calma. Lembre: a dica está nos pares (1,2) e (2,3) — e o que eles implicam sobre (1,3)...", mood: 'blink' },
  },

  // FASE 5
  equivalence: {
    intro: [
      { text: "Quinto sinal — e o mais poderoso que vimos até agora.", mood: 'talk' },
      { text: "A GAR usa RELAÇÕES DE EQUIVALÊNCIA para agrupar suas frotas. São ao mesmo tempo reflexivas, simétricas E transitivas. Construa uma do zero — você tem liberdade total!", mood: 'talk' },
      { text: "Existem várias soluções válidas. A mais simples é só a diagonal. A mais completa é marcar tudo. Mas qualquer 'agrupamento' coerente de naves também funciona!", mood: 'idle' },
    ],
    success: { text: "Magnífico! Cinco padrões decifrados — a GAR está ficando nervosa! Metade do caminho para o quartel-general deles. Continue!", mood: 'happy' },
    fail:    { text: "Ainda não está completo. Lembre das três regras: toda nave fala consigo mesma, toda comunicação é de ida e volta, e cadeias sempre têm atalho.", mood: 'blink' },
  },

  // FASE 6
  reflex_sym: {
    intro: [
      { text: "Sexto sinal — agora a GAR começa a usar padrões mais sofisticados.", mood: 'talk' },
      { text: "Este padrão precisa ser REFLEXIVO e SIMÉTRICO ao mesmo tempo. Os pares fixos já estão lá — sua missão é completar as duas propriedades de uma vez só!", mood: 'talk' },
      { text: "Comece pela diagonal — toda nave fala consigo mesma. Depois verifique os espelhos dos pares fixos. Duas missões numa tacada só!", mood: 'idle' },
    ],
    success: { text: "Dois em um! Reflexivo e simétrico ao mesmo tempo — você está lendo esses padrões como um livro aberto. A GAR não tem mais segredos para nós!", mood: 'happy' },
    fail:    { text: "Falta coisa ainda. Verifique as duas condições separadamente: primeiro a diagonal completa, depois os espelhos. Uma de cada vez!", mood: 'blink' },
  },

  // FASE 7
  classify_6: {
    intro: [
      { text: "Sétimo sinal — matriz maior, padrão mais denso. A GAR está ficando desesperada e aumentando a complexidade dos códigos!", mood: 'talk' },
      { text: "Tabuleiro 6x6 desta vez. Analise e classifique as quatro propriedades. Este padrão tem uma característica bem específica — reflexivo e transitivo, mas...", mood: 'talk' },
      { text: "...mas será que toda nave que fala com outra recebe resposta? Procure um par e seu oposto. Se um existe e o outro não, você sabe o que isso significa!", mood: 'idle' },
    ],
    success: { text: "Análise impecável! Com 6 frotas nesse padrão, você não errou uma vírgula. A GAR está perdendo o controle dos próprios códigos!", mood: 'happy' },
    fail:    { text: "Releia o padrão com cuidado. Às vezes o que parece simétrico... não é. E se não é simétrico, o que isso diz sobre equivalência?", mood: 'blink' },
  },

  // FASE 8
  transitive_hard: {
    intro: [
      { text: "Oitavo sinal — e olha o tamanho disso! Sete frotas em ação.", mood: 'talk' },
      { text: "Desta vez o padrão precisa ser TRANSITIVO — mas sem necessariamente ser reflexivo. As cadeias são mais tortuosas, cruzam em vários pontos. Feche tudo!", mood: 'talk' },
      { text: "Estratégia: siga cada caminho passo a passo. Depois de fechar um par novo, verifique SE ELE cria novas obrigações. É um trabalho de paciência — como amarrar um nó de oito!", mood: 'idle' },
    ],
    success: { text: "Fantástico! Todas as cadeias fechadas em 7 frotas — isso exigiu concentração de verdade. O quartel-general da GAR está quase ao alcance!", mood: 'happy' },
    fail:    { text: "Ainda tem cadeia aberta. Procure dois pares que 'encaixam' — onde o b de um é o a do outro. O resultado falta estar marcado!", mood: 'blink' },
  },

  // FASE 9
  classify_equiv: {
    intro: [
      { text: "Nono sinal — estamos tão perto que consigo cheirar a pólvora do quartel-general deles!", mood: 'talk' },
      { text: "Este padrão é o maior que classificamos até agora — 8 frotas. Mas cuidado: desta vez pode ser que TODAS as propriedades sejam verdadeiras. Não suponha nada!", mood: 'talk' },
      { text: "Verifique cada propriedade com rigor absoluto. A GAR adora esconder uma equivalência dentro de um padrão complicado para confundir analistas preguiçosos!", mood: 'idle' },
    ],
    success: { text: "Isso aí! Classificação perfeita numa matriz 8x8. Um sinal de equivalência — a GAR agrupou suas frotas em dois esquadrões. Sabemos tudo agora!", mood: 'happy' },
    fail:    { text: "Revise devagar. Às vezes a relação É de equivalência, e o analista não acredita. Verifique os blocos — tudo dentro de cada bloco se relaciona com tudo?", mood: 'blink' },
  },

  // FASE 10
  final_challenge: {
    intro: [
      { text: "...Este é o momento, marujo. O sinal final. O padrão do quartel-general da Armada GAR.", mood: 'talk' },
      { text: "Dez frotas. Quatro grupos secretos. Sua missão: construir a relação de equivalência EXATA que corresponde à partição { {1,2,3}, {4,5,6}, {7,8}, {9,10} }.", mood: 'talk' },
      { text: "Marque os 26 pares certos e revelamos as coordenadas do QG. Não pode errar. Não temos segunda chance. Toda a frota aliada está contando com você.", mood: 'idle' },
      { text: "...E hey. Se você chegou até aqui, você é bom nisso. Confio em você, marujo. Vá lá e afunde esses filhos de GAR!", mood: 'happy' },
    ],
    success: { text: "ISSO! COORDENADAS CONFIRMADAS! Os canhões estão apontados! A Armada GAR não sabe o que está vindo... FOGO À VONTADE! OPERAÇÃO NÓ GÓRDIO: CONCLUÍDA!", mood: 'happy' },
    fail:    { text: "Quase, quase... Lembre da partição: elementos da MESMA classe se relacionam entre si, e com mais ninguém de outra classe. Você consegue!", mood: 'blink' },
  },
};


// ═══════════════════════════════════════════════════════════════════
//  SISTEMA DE DIÁLOGO — Caixa estilo Stardew Valley com o Willy
// ═══════════════════════════════════════════════════════════════════

const Dialog = (() => {

  // Estado interno
  let queue       = [];   // fila de falas
  let onDone      = null; // callback ao fechar
  let animTimer   = null; // timer de animação do sprite
  let typeTimer   = null; // timer de typewriter
  let currentText = '';
  let targetText  = '';
  let typeIndex   = 0;
  let canAdvance  = false;

  // Mapeamento de mood → sequência de frames
const ANIM = {
  idle:  { frames: ['f2','f4','f2','f3'], fps: 2              }, // loop automático lento
  talk:  { frames: ['f1','f2'],           fps: 0, click: true }, // só troca no clique
  blink: { frames: ['f2','f3'],           fps: 0              }, // mostra f2, persiste em f3
  happy: { frames: ['f2','f1'],           fps: 0              }, // mostra f2, persiste em f1
};

  let animFrame = 0;

  // ── Criar elemento HTML da caixa de diálogo ──────────────────
  function createBox() {
    // Remover instância anterior se existir
    const existing = document.getElementById('dialog-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.innerHTML = `
      <div id="dialog-box">
        <div id="dialog-portrait-wrap">
          <img id="dialog-portrait" src="" alt="Willy" />
          <div id="dialog-name">WILLY OL' MAN</div>
        </div>
        <div id="dialog-body">
          <div id="dialog-text"></div>
          <div id="dialog-cursor" class="blink">▼</div>
        </div>
      </div>
    `;

    // Fechar ao clicar em qualquer lugar da caixa
    overlay.addEventListener('click', advance);
    document.removeEventListener('keydown', onKey); // limpar listener anterior se houver
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
  }

  function onKey(e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      advance();
    }
  }

  // ── Mostrar diálogo ───────────────────────────────────────────
  // slides: array de { text, mood } ou string simples
  // done: callback quando terminar tudo
  function show(slides, done) {
    if (!slides || !slides.length) { if (done) done(); return; }

    // Normalizar
    queue = slides.map(s => typeof s === 'string' ? { text:s, mood:'talk' } : s);
    onDone = done || null;

    createBox();
    document.getElementById('dialog-overlay').classList.add('active');
    showNext();
  }

  function showNext() {
    if (!queue.length) {
      close();
      return;
    }
    const slide = queue.shift();
    setMood(slide.mood || 'talk');
    typeText(slide.text);
  }

  // ── Typewriter effect ─────────────────────────────────────────
  function typeText(text) {
    targetText  = text;
    currentText = '';
    typeIndex   = 0;
    canAdvance  = false;
    document.getElementById('dialog-cursor').style.opacity = '0';

    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
      const textEl   = document.getElementById('dialog-text');
      const cursorEl = document.getElementById('dialog-cursor');
      if (!textEl) { clearInterval(typeTimer); return; } // overlay foi removido
      if (typeIndex < targetText.length) {
        currentText += targetText[typeIndex++];
        textEl.innerHTML = currentText;
        Audio.blip();
      } else {
        clearInterval(typeTimer);
        canAdvance = true;
        if (cursorEl) cursorEl.style.opacity = '1';
      }
    }, 28);
  }

  // ── Avançar diálogo ───────────────────────────────────────────
  function advance() {
    // Se ainda está digitando, mostrar texto completo primeiro

    const overlay = document.getElementById('dialog-overlay');
    if (overlay && overlay._clickAnim) overlay._clickAnim();

    if (!canAdvance) {
      clearInterval(typeTimer);
      currentText = targetText;
      const textEl   = document.getElementById('dialog-text');
      const cursorEl = document.getElementById('dialog-cursor');
      if (textEl)   textEl.innerHTML = currentText;
      if (cursorEl) cursorEl.style.opacity = '1';
      canAdvance = true;
      return;
    }
    showNext();
  }

  // ── Animação do sprite ────────────────────────────────────────
  function setMood(mood) {
    const anim = ANIM[mood] || ANIM.idle;
    clearInterval(animTimer);
    animFrame = 0;

    function showFrame(idx) {
      const frame = anim.frames[idx % anim.frames.length];
      const img = document.getElementById('dialog-portrait');
      if (img && WILLY_SPRITES[frame]) img.src = WILLY_SPRITES[frame];
    }

    if (anim.click) {
      // talk: mostra primeiro frame agora; cada clique avança pro próximo
      showFrame(0);
      animFrame = 1;
      const overlay = document.getElementById('dialog-overlay');
      if (overlay) {
        overlay._clickAnim = () => {
          showFrame(animFrame);
          animFrame++;
        };
      }
    } else if (anim.fps === 0) {
      // blink / happy: passa pelos frames uma vez (300ms entre cada) e para no último
      let i = 0;
      showFrame(i);
      if (anim.frames.length > 1) {
        const seq = setInterval(() => {
          i++;
          showFrame(i);
          if (i >= anim.frames.length - 1) clearInterval(seq);
        }, 300);
      }
    } else {
      // idle: loop contínuo automático
      let i = 0;
      showFrame(i);
      animTimer = setInterval(() => {
        i++;
        showFrame(i);
      }, 1000 / anim.fps);
    }
  }

  // ── Fechar caixa ──────────────────────────────────────────────
  function close() {
    clearInterval(animTimer);
    clearInterval(typeTimer);
    document.removeEventListener('keydown', onKey);

    const overlay = document.getElementById('dialog-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.remove(); // remover imediatamente para evitar conflito com next Dialog.show
    }
    if (onDone) { onDone(); onDone = null; }
  }

  return { show, close };

})();

// ═══════════════════════════════════════════════════════════════════
//  TELA DE INTRODUÇÃO NARRATIVA
// ═══════════════════════════════════════════════════════════════════

const Intro = (() => {

  let slideIndex = 0;
  let onDone = null;
  let typeTimer = null;
  let canAdvance = false;

  function show(done) {
    onDone = done;
    slideIndex = 0;

    // Criar overlay de intro
    const el = document.createElement('div');
    el.id = 'intro-overlay';
    el.innerHTML = `
      <div id="intro-box">
        <div id="intro-title"></div>
        <div id="intro-text"></div>
        <div id="intro-continue" class="blink">[ CLIQUE PARA CONTINUAR ]</div>
      </div>
      <div id="intro-skip" onclick="Intro.skip()">PULAR  ▶▶</div>
    `;
    el.addEventListener('click', () => advance());
    document.addEventListener('keydown', introKey);
    document.body.appendChild(el);

    setTimeout(() => el.classList.add('active'), 10);
    showSlide(0);
  }

  function introKey(e) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); }
    if (e.key === 'Escape') skip();
  }

  function showSlide(idx) {
    const slide = INTRO_SLIDES[idx];
    if (!slide) { close(); return; }

    canAdvance = false;
    document.getElementById('intro-continue').style.opacity = '0';

    // Se tem willy, mostrar via Dialog sobre o intro-overlay
    if (slide.willy) {
      close();
      // Mostrar slides restantes com willy via Dialog
      const remaining = INTRO_SLIDES.slice(idx).filter(s => s.willy);
      Dialog.show(remaining, onDone);
      return;
    }

    // Slide de texto puro
    const titleEl = document.getElementById('intro-title');
    const textEl  = document.getElementById('intro-text');
    titleEl.textContent = slide.title || '';
    textEl.innerHTML = '';

    let i = 0;
    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
      if (i < slide.text.length) {
        textEl.innerHTML += slide.text[i++];
      } else {
        clearInterval(typeTimer);
        canAdvance = true;
        document.getElementById('intro-continue').style.opacity = '1';
      }
    }, 22);
  }

  function advance() {
    if (!canAdvance) {
      // Completar texto atual
      clearInterval(typeTimer);
      const slide = INTRO_SLIDES[slideIndex];
      if (slide && document.getElementById('intro-text'))
        document.getElementById('intro-text').innerHTML = slide.text || '';
      canAdvance = true;
      document.getElementById('intro-continue').style.opacity = '1';
      return;
    }
    slideIndex++;
    showSlide(slideIndex);
  }

  function skip() {
    close();
    if (onDone) { onDone(); onDone = null; }
  }

  function close() {
    clearInterval(typeTimer);
    document.removeEventListener('keydown', introKey);
    const el = document.getElementById('intro-overlay');
    if (el) { el.classList.remove('active'); setTimeout(() => el.remove(), 300); }
  }

  return { show, skip };

})();



// ═══════════════════════════════════════════════════════════════════
//  SISTEMA DE ÁUDIO
//  - Música: audio/theme_song.ogg
//  - Blips de voz: Web Audio API (sem arquivo externo)
//  - Botão mute: assets/mute_ic_1.png (mutado) / mute_ic_2.png (ativo)
// ═══════════════════════════════════════════════════════════════════

const Audio = (() => {

  let muted   = false;
  let bgMusic = null;
  let audioCtx = null;
  let started  = false;

  function init() {
    if (started) return;
    started = true;

    // Música de fundo
    bgMusic = document.createElement('audio');
    bgMusic.src    = 'audio/theme_song.ogg';
    bgMusic.loop   = true;
    bgMusic.volume = 0.15;
    document.body.appendChild(bgMusic);

    bgMusic.play().catch(() => {
      document.addEventListener('click', () => bgMusic.play().catch(()=>{}), { once: true });
    });

    // Web Audio API para blips de voz
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { audioCtx = null; }
  }

  // ── Murmurinho estilo Stardew Valley ──────────────────────────
  // Cada letra dispara um "fonema" sintético:
  //   1. Oscilador sawtooth (base da voz humana)
  //   2. BandPass filter (timbre vocal — grave para o Willy)
  //   3. Envelope curtíssimo com pitch levemente aleatório
  //   4. Cooldown por letra para não sobrecarregar
  let blipCooldownTime = 0;

  // Notas base para o Willy: voz grave de marinheiro velho (~100-160 Hz)
  // Pequena variação aleatória por letra para soar como "sílabas"
  const WILLY_BASE_FREQ = 115;   // Hz — quanto mais baixo, mais grave
  const WILLY_FREQ_VAR  = 35;    // variação aleatória acima da base
  const WILLY_FILTER_HZ = 800;   // centro do bandpass — formante vocal
  const WILLY_DURATION  = 0.075; // segundos por "fonema"
  const WILLY_COOLDOWN  = 55;    // ms entre fonemas

  function blip() {
    if (muted || !audioCtx) return;

    // Cooldown baseado em tempo real (mais preciso que flag booleana)
    const now = audioCtx.currentTime;
    if (now < blipCooldownTime) return;
    blipCooldownTime = now + WILLY_COOLDOWN / 1000;

    try {
      // Pitch levemente aleatório — soa como sílabas diferentes
      const pitch = WILLY_BASE_FREQ + Math.random() * WILLY_FREQ_VAR;

      // 1. Oscilador principal — sawtooth é mais parecido com voz humana
      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, now);
      // Pequena variação de pitch DURANTE a nota (como vogal)
      osc.frequency.linearRampToValueAtTime(pitch * (0.92 + Math.random() * 0.16), now + WILLY_DURATION);

      // 2. Filtro bandpass — imita o trato vocal humano
      const filter = audioCtx.createBiquadFilter();
      filter.type            = 'bandpass';
      filter.frequency.value = WILLY_FILTER_HZ;
      filter.Q.value         = 2.5; // largura do formante

      // 3. Segundo filtro lowpass — suaviza os harmônicos altos (voz velha)
      const lowpass = audioCtx.createBiquadFilter();
      lowpass.type            = 'lowpass';
      lowpass.frequency.value = 1400;

      // 4. Envelope de amplitude — ataque rápido, decay suave
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.008);          // ataque
      gain.gain.exponentialRampToValueAtTime(0.001, now + WILLY_DURATION); // decay

      // Cadeia: osc → filter → lowpass → gain → saída
      osc.connect(filter);
      filter.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + WILLY_DURATION + 0.01);

    } catch(e) {}
  }

  function toggleMute() {
    muted = !muted;
    if (bgMusic) bgMusic.volume = muted ? 0 : 0.35;
    const btn = document.getElementById('mute-btn');
    if (btn) {
      const img = btn.querySelector('img');
      // mute_ic_1 = ícone de mutado | mute_ic_2 = ícone de som ativo
      if (img) img.src = muted ? 'assets/mute_ic_1.png' : 'assets/mute_ic_2.png';
      btn.title = muted ? 'Ativar som' : 'Silenciar';
    }
  }

  function isMuted() { return muted; }

  return { init, blip, toggleMute, isMuted };

})();

const Game = (() => {

  // ── CONJUNTO A ───────────────────────────────────────────────
  let N = 4;
  let SET_A = [1, 2, 3, 4];          // valores visíveis
  const key   = (i, j) => `${i},${j}`; // chave interna (0-indexed)
  const val   = (i)    => SET_A[i];    // índice → valor
  const ps    = (i, j) => `(${val(i)},${val(j)})`; // exibe "(1,2)"

  // ── ESTADO GLOBAL ────────────────────────────────────────────
  let state = {
    phase:    0,
    score:    0,
    history:  [],       // { phase, ok, pts, attempts }
    active:   new Set(),
    classifAns: {},
    checked:  false,
    attempts: 0,
    hintOpen: false,
  };

  // ════════════════════════════════════════════════════════════════
  //  DEFINIÇÃO DAS FASES (usando classe Phase)
  // ════════════════════════════════════════════════════════════════
  const PHASES = [

    // ──────────────────────────────────────────────────────────
    // FASE 1 — REFLEXIVA
    // Ativar EXATAMENTE a diagonal (a,a). Sem pares extras.
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'reflexive',
      name: 'FASE 1 — REFLEXIVIDADE',
      icon: '🔁',
      objective:
        'Marque EXATAMENTE os pares da diagonal: (1,1), (2,2), (3,3) e (4,4). ' +
        'Nem mais, nem menos! Uma relação reflexiva garante que todo elemento se comunica consigo mesmo.',
      hint: `
        <b>Propriedade Reflexiva</b><br>
        R é <b>reflexiva</b> quando <b>(a,a) ∈ R</b> para todo a ∈ A.<br><br>
        No tabuleiro, isso significa marcar a <b>diagonal principal</b>:<br>
        (1,1) · (2,2) · (3,3) · (4,4)<br><br>
        Atenção: marcar pares fora da diagonal não é errado em geral,
        mas nesta fase o objetivo é a relação reflexiva <em>mínima</em> — exatamente a diagonal.
      `,
      setDisplay: 'A = {1, 2, 3, 4}',
      initialActive: [],
      locked: [],

      check(active) {
        const diag    = [0,1,2,3].map(i => key(i,i));
        const missing = diag.filter(k => !active.has(k));
        const extra   = [...active].filter(k => {
          const [i,j] = k.split(',').map(Number); return i !== j;
        });

        if (!missing.length && !extra.length)
          return { ok:true, msg:'Perfeito! A diagonal está toda marcada — relação reflexiva!' };

        const msgs = [];
        if (missing.length) {
          const list = missing.map(k => { const [i,j]=k.split(',').map(Number); return ps(i,j); });
          msgs.push(`Faltam na diagonal: <b>${list.join(', ')}</b>`);
        }
        if (extra.length) {
          const list = extra.map(k => { const [i,j]=k.split(',').map(Number); return ps(i,j); });
          msgs.push(`Pares extras (remova): <b>${list.join(', ')}</b> — fora da diagonal`);
        }
        return { ok:false, msg:msgs.join('<br>'), missing, extra };
      },

      highlight(active, r) {
        [0,1,2,3].forEach(i => {
          const k = key(i,i);
          markCell(k, active.has(k) ? 'f-ok' : 'f-miss');
        });
        if (r.extra) r.extra.forEach(k => markCell(k,'f-err'));
      }
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 2 — SIMÉTRICA
    // Pares fixos dados. Encontrar todos os espelhos.
    // Com números fica óbvio: espelho de (1,2) é (2,1).
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'symmetric',
      name: 'FASE 2 — SIMETRIA',
      icon: '🔄',
      objective:
        'Os pares fixos (⚓ tracejado) já fazem parte da relação. ' +
        'Para ser Simétrica: se (a,b) existe, (b,a) também deve existir. ' +
        'Ex: (1,2) está fixo → marque (2,1).',
      hint: `
        <b>Propriedade Simétrica</b><br>
        R é <b>simétrica</b> quando: se (a,b) ∈ R → (b,a) ∈ R.<br><br>
        No tabuleiro: o par <b>espelhado na diagonal</b> deve estar marcado.<br>
        Se (1,2) está marcado (linha 1, col 2), então (2,1) (linha 2, col 1) deve estar também.<br><br>
        <b>Dica visual:</b> a relação simétrica é um tabuleiro <em>espelhado</em> na diagonal.
      `,
      setDisplay: 'A = {1, 2, 3, 4}',
      // Pares dados: (1,2),(1,3),(2,4),(3,4)
      initialActive: ['0,1','0,2','1,3','2,3'],
      locked:        ['0,1','0,2','1,3','2,3'],

      check(active) {
        if (active.size === N * N)
          return { ok:false, msg:'Marcar todas as células não vale! Encontre a relação simétrica correta.' };

        const missing = [];
        for (const k of active) {
          const [i,j] = k.split(',').map(Number);
          const mir = key(j,i);
          if (!active.has(mir)) missing.push({ need:mir, from:k });
        }
        if (!missing.length)
          return { ok:true, msg:'Excelente! Todos os pares têm seus espelhos — relação simétrica!' };

        const msgs = missing.map(({ need, from }) => {
          const [ni,nj] = need.split(',').map(Number);
          const [fi,fj] = from.split(',').map(Number);
          return `${ps(fi,fj)} existe → marque o espelho <b>${ps(ni,nj)}</b>`;
        });
        return { ok:false, msg:msgs.join('<br>'), missing:missing.map(m=>m.need) };
      },

      highlight(active, r) {
        const misSet = new Set(r.missing||[]);
        for (const k of active) {
          const [i,j] = k.split(',').map(Number);
          markCell(k, active.has(key(j,i)) ? 'f-ok' : 'f-err');
        }
        misSet.forEach(k => markCell(k,'f-miss'));
      }
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 3 — TRANSITIVA
    // Pares iniciais + diagonal dados. Fechar transitividade.
    // Fechamento iterativo: novos pares geram mais necessidades.
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'transitive',
      name: 'FASE 3 — TRANSITIVIDADE',
      icon: '⛓️',
      objective:
        'Complete a relação para que seja Transitiva: ' +
        'se (a,b) e (b,c) existem, então (a,c) deve existir. ' +
        'Atenção: fechar um par pode criar novas obrigações!',
      hint: `
        <b>Propriedade Transitiva</b><br>
        R é <b>transitiva</b> quando: se (a,b) ∈ R e (b,c) ∈ R → (a,c) ∈ R.<br><br>
        Estratégia: vá par a par, procurando "encadeamentos".<br>
        Ex: (1,2) e (2,3) → precisa de (1,3).<br>
        Depois: (1,3) e (3,?) podem gerar mais...<br><br>
        <b>Dica:</b> repita até não encontrar mais lacunas.
        O processo pode se encadear várias vezes!
      `,
      setDisplay: 'A = {1, 2, 3, 4}',
      // Dados: diagonal + (1,2),(2,1),(1,3),(3,1)
      initialActive: ['0,0','1,1','2,2','3,3','0,1','1,0','0,2','2,0'],
      locked:        ['0,0','1,1','2,2','3,3','0,1','1,0','0,2','2,0'],

      check(active) {
        // Fechamento transitivo iterativo sobre o que o aluno marcou
        const current = new Set(active);
        const needed  = new Map(); // key → { need, p1, p2 }
        let changed   = true;
        while (changed) {
          changed = false;
          for (const p1 of [...current]) {
            const [a, b1] = p1.split(',').map(Number);
            for (const p2 of [...current]) {
              const [b2, c] = p2.split(',').map(Number);
              if (b1 === b2) {
                const need = key(a,c);
                if (!current.has(need)) {
                  needed.set(need, { need, p1, p2 });
                  current.add(need);
                  changed = true;
                }
              }
            }
          }
        }
        const realMissing = [...needed.values()].filter(m => !active.has(m.need));

        if (active.size === N * N)
          return { ok:false, msg:'Marcar todas as células não vale! Encontre o fecho transitivo correto.' };

        if (!realMissing.length)
          return { ok:true, msg:'Fantástico! Todas as cadeias estão fechadas — relação transitiva!' };

        const msgs = realMissing.slice(0,5).map(({ p1, p2, need }) => {
          const [ai,bi] = p1.split(',').map(Number);
          const [bj,cj] = p2.split(',').map(Number);
          const [ni,nj] = need.split(',').map(Number);
          return `${ps(ai,bi)} + ${ps(bj,cj)} → falta <b>${ps(ni,nj)}</b>`;
        });
        if (realMissing.length > 5) msgs.push(`…e mais ${realMissing.length-5} pares`);
        return { ok:false, msg:msgs.join('<br>'), missing:realMissing.map(m=>m.need) };
      },

      highlight(active, r) {
        const misSet = new Set(r.missing||[]);
        const bad = new Set();
        for (const p1 of active) {
          const [a,b1] = p1.split(',').map(Number);
          for (const p2 of active) {
            const [b2,c] = p2.split(',').map(Number);
            if (b1===b2 && !active.has(key(a,c))) { bad.add(p1); bad.add(p2); }
          }
        }
        for (const k of active) markCell(k, bad.has(k) ? 'f-err' : 'f-ok');
        misSet.forEach(k => markCell(k,'f-miss'));
      }
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 4 — CLASSIFICAÇÃO
    // Relação: reflexiva + simétrica, mas NÃO transitiva
    // Armadilha: parece completa mas (1,2)+(2,3) → falta (1,3)
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'classify',
      name: 'FASE 4 — CLASSIFICAÇÃO',
      icon: '🔬',
      objective:
        'Analise a relação exibida (pares fixos) e classifique cada propriedade com SIM ou NÃO. ' +
        'Cuidado — há uma armadilha! Observe com atenção.',
      hint: `
        <b>Como classificar passo a passo:</b><br><br>
        <b>1. Reflexiva?</b> (1,1),(2,2),(3,3),(4,4) estão todos marcados?<br>
        <b>2. Simétrica?</b> Para cada (a,b), existe o espelho (b,a)?<br>
        <b>3. Transitiva?</b> Procure: (a,b) e (b,c) → (a,c) existe?<br>
        <b>4. Equivalência?</b> As 3 anteriores ao mesmo tempo?<br><br>
        <b>Dica desta fase:</b> olhe para (1,2) e (2,3).
        Se ambos estão marcados, (1,3) deveria existir…
      `,
      setDisplay: 'A = {1, 2, 3, 4}',
      // R = {(1,1),(2,2),(3,3),(4,4),(1,2),(2,1),(2,3),(3,2)}
      // Reflexiva: SIM | Simétrica: SIM | Transitiva: NÃO (falta (1,3) e (3,1)) | Equiv: NÃO
      initialActive: ['0,0','1,1','2,2','3,3','0,1','1,0','1,2','2,1'],
      locked:        ['0,0','1,1','2,2','3,3','0,1','1,0','1,2','2,1'],

      answers: {
        reflexiva:    true,
        simetrica:    true,
        transitiva:   false,
        equivalencia: false,
      },

      check(active, classifAns) {
        const props = ['reflexiva','simetrica','transitiva','equivalencia'];
        const notAns = props.filter(p => !classifAns[p]);
        if (notAns.length)
          return { ok:false, incomplete:true, msg:'Responda todas as 4 propriedades antes de verificar!' };

        const ans   = this.answers;
        const wrong = props.filter(p => (classifAns[p]==='sim') !== ans[p]);
        if (!wrong.length)
          return { ok:true, msg:'Análise perfeita! Você identificou todas as propriedades corretamente!' };

        const labels = { reflexiva:'Reflexiva', simetrica:'Simétrica', transitiva:'Transitiva', equivalencia:'Equivalência' };
        const justif = {
          reflexiva:    ' — Def: ∀a(a ∈ A → (a,a) ∈ R). A diagonal completa deve estar marcada.',
          simetrica:    ' — Def: ∀a,b((a,b) ∈ R → (b,a) ∈ R). Todo par deve ter seu espelho.',
          transitiva:   ' — Def: ∀a,b,c((a,b) ∈ R ∧ (b,c) ∈ R → (a,c) ∈ R). (1,2) e (2,3) existem, mas (1,3) não está!',
          equivalencia: ' — Requer reflexiva ∧ simétrica ∧ transitiva. Como não é transitiva, não pode ser equivalência.',
        };
        const msgs = wrong.map(p =>
          `<b>${labels[p]}</b>: correto é <b>${ans[p]?'SIM':'NÃO'}</b>${justif[p]||''}`
        );
        return { ok:false, msg:msgs.join('<br>'), wrong };
      },

      highlight() {} // usa interface de classificação
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 5 — EQUIVALÊNCIA COMPLETA
    // Construção livre. Múltiplas soluções válidas.
    // Verificação rigorosa das 3 propriedades.
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'equivalence',
      name: 'FASE 5 — EQUIVALÊNCIA',
      icon: '⭐',
      objective:
        'Monte uma relação de equivalência para A={1,2,3,4}: ' +
        'deve ser Reflexiva + Simétrica + Transitiva ao mesmo tempo. ' +
        'Existem várias soluções válidas — encontre uma!',
      hint: `
        <b>Relação de Equivalência = R + S + T juntas</b><br><br>
        <b>Soluções válidas:</b><br>
        • Só a diagonal: {(1,1),(2,2),(3,3),(4,4)} — 4 pares<br>
        • Produto completo: todos os 16 pares (exceto marcar literalmente tudo de uma vez)<br>
        • Partição {1,2} e {3,4}: marque (1,1),(1,2),(2,1),(2,2) e (3,3),(3,4),(4,3),(4,4)<br><br>
        <b>Estratégia:</b> pense em <em>classes</em>.
        Quem fica no mesmo grupo? Marque todos os pares dentro de cada grupo.
      `,
      setDisplay: 'A = {1, 2, 3, 4}',
      initialActive: [],
      locked: [],

      check(active) {
        if (!active.size)
          return { ok:false, msg:'Marque pelo menos alguns pares para começar!' };

        const errors = [];

        // 1. Reflexiva
        for (let i=0;i<N;i++)
          if (!active.has(key(i,i)))
            errors.push(`Não reflexiva: falta <b>${ps(i,i)}</b>`);

        // 2. Simétrica
        for (const k of active) {
          const [i,j] = k.split(',').map(Number);
          if (!active.has(key(j,i)))
            errors.push(`Não simétrica: ${ps(i,j)} existe mas falta <b>${ps(j,i)}</b>`);
        }

        // 3. Transitiva — calcular fecho
        const cur = new Set(active);
        let changed = true;
        const transitNeeded = new Set();
        while (changed) {
          changed = false;
          for (const p1 of [...cur]) {
            const [a,b1] = p1.split(',').map(Number);
            for (const p2 of [...cur]) {
              const [b2,c] = p2.split(',').map(Number);
              if (b1===b2) {
                const need = key(a,c);
                if (!cur.has(need)) { transitNeeded.add(need); cur.add(need); changed=true; }
              }
            }
          }
        }
        for (const k of transitNeeded)
          if (!active.has(k)) {
            const [i,j] = k.split(',').map(Number);
            errors.push(`Não transitiva: falta <b>${ps(i,j)}</b>`);
          }

        const unique = [...new Set(errors)];
        if (unique.length)
          return { ok:false, msg:unique.slice(0,5).join('<br>') + (unique.length>5?'<br>…':'') };

        // Bloquear apenas o caso de marcar tudo
        if (active.size === N * N)
          return { ok:false, msg:'Marcar todas as células não vale! Escolha uma partição e monte a equivalência corretamente.' };

        return { ok:true, msg:'BRILHANTE! Relação de equivalência válida construída com sucesso!' };
      },

      highlight(active, r) {
        if (r.ok) { for (const k of active) markCell(k,'f-ok'); return; }

        const bad  = new Set();
        const miss = new Set();

        for (let i=0;i<N;i++)
          if (!active.has(key(i,i))) miss.add(key(i,i));

        for (const k of active) {
          const [i,j] = k.split(',').map(Number);
          if (!active.has(key(j,i))) bad.add(k);
        }

        const cur = new Set(active);
        let changed = true;
        while (changed) {
          changed = false;
          for (const p1 of [...cur]) {
            const [a,b1] = p1.split(',').map(Number);
            for (const p2 of [...cur]) {
              const [b2,c] = p2.split(',').map(Number);
              if (b1===b2) {
                const need = key(a,c);
                if (!cur.has(need)) { miss.add(need); cur.add(need); changed=true; }
              }
            }
          }
        }
        for (const p1 of active) {
          const [a,b1] = p1.split(',').map(Number);
          for (const p2 of active) {
            const [b2,c] = p2.split(',').map(Number);
            if (b1===b2 && !active.has(key(a,c))) { bad.add(p1); bad.add(p2); }
          }
        }

        for (const k of active) markCell(k, bad.has(k) ? 'f-err' : 'f-ok');
        for (const k of miss) if (!active.has(k)) markCell(k,'f-miss');
      }
    }),


    // ──────────────────────────────────────────────────────────
    // FASE 6 — REFLEXIVA + SIMÉTRICA: CONSTRUÇÃO CONJUNTA (5×5)
    // Aluno recebe pares fixos não-reflexivos e não-simétricos.
    // Deve completar a relação para ser AMBAS ao mesmo tempo.
    // Twist: a diagonal não está dada — é responsabilidade do aluno.
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'reflex_sym',
      name: 'FASE 6 — REFLEXIVA E SIMÉTRICA',
      icon: '🔁🔄',
      size: 5,
      setA: [1,2,3,4,5],
      setDisplay: 'A = {1, 2, 3, 4, 5}',
      objective:
        'Complete a relação para que ela seja REFLEXIVA e SIMÉTRICA ao mesmo tempo. ' +
        'Os pares fixos já fazem parte da relação — adicione o que falta para satisfazer as duas propriedades.',
      hint: `
        <b>Reflexiva E Simétrica juntas</b><br>
        Para ser <b>reflexiva</b>: ative toda a diagonal — (1,1),(2,2),(3,3),(4,4),(5,5).<br>
        Para ser <b>simétrica</b>: para cada par (a,b) ativo, ative também (b,a).<br><br>
        Faça as duas ao mesmo tempo!<br><br>
        Pares fixos dados: (1,3),(2,4),(3,5)<br>
        Logo você precisa de: (3,1),(4,2),(5,3) — e toda a diagonal.
      `,
      // Pares fixos: (1,3),(2,4),(3,5) → índices (0,2),(1,3),(2,4)
      initialActive: ['0,2','1,3','2,4'],
      locked:        ['0,2','1,3','2,4'],

      check(active) {
        const n = 5;
        const msgs = [];

        // 1. Verificar reflexiva
        const missDiag = [];
        for (let i = 0; i < n; i++) {
          if (!active.has(key(i,i))) missDiag.push(ps(i,i));
        }

        // 2. Verificar simétrica
        const missMirror = [];
        for (const k of active) {
          const [i,j] = k.split(',').map(Number);
          if (!active.has(key(j,i))) {
            missMirror.push(`${ps(i,j)} → falta ${ps(j,i)}`);
          }
        }

        const n5 = 5;
        if (active.size === n5 * n5)
          return { ok:false, msg:'Marcar todas as células não vale! Encontre a relação reflexiva e simétrica correta.' };

        if (!missDiag.length && !missMirror.length)
          return { ok:true, msg:'Perfeito! A relação é reflexiva E simétrica ao mesmo tempo!' };

        if (missDiag.length)
          msgs.push(`Não reflexiva — faltam na diagonal: <b>${missDiag.join(', ')}</b>`);
        if (missMirror.length)
          msgs.push(`Não simétrica — pares sem espelho:<br><b>${missMirror.join('<br>')}</b>`);

        return { ok:false, msg:msgs.join('<br>') };
      },

      highlight(active, r) {
        const n = 5;
        for (let i = 0; i < n; i++) {
          const k = key(i,i);
          markCell(k, active.has(k) ? 'f-ok' : 'f-miss');
        }
        for (const k of active) {
          const [i,j] = k.split(',').map(Number);
          if (i === j) continue;
          markCell(k, active.has(key(j,i)) ? 'f-ok' : 'f-err');
        }
        for (const k of active) {
          const [i,j] = k.split(',').map(Number);
          const mir = key(j,i);
          if (!active.has(mir)) markCell(mir, 'f-miss');
        }
      }
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 7 — CLASSIFICAÇÃO EM MATRIZ 6×6
    // Relação dada: reflexiva e transitiva, mas NÃO simétrica
    // → logo NÃO é equivalência.
    // Armadilha clássica: transitiva parece certa mas simetria falha.
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'classify_6',
      name: 'FASE 7 — CLASSIFICAÇÃO',
      icon: '🔬',
      size: 6,
      setA: [1,2,3,4,5,6],
      setDisplay: 'A = {1, 2, 3, 4, 5, 6}',
      objective:
        'Analise a relação exibida no tabuleiro 6×6 e classifique cada propriedade com SIM ou NÃO. ' +
        'Atenção: esta relação tem duas armadilhas sutis!',
      hint: `
        <b>Checklist de classificação:</b><br><br>
        <b>1. Reflexiva?</b> Todos os (a,a) estão marcados?<br>
        <b>2. Simétrica?</b> Todo par (a,b) tem seu espelho (b,a)?<br>
        <b>3. Transitiva?</b> Toda cadeia (a,b)+(b,c) tem (a,c)?<br>
        <b>4. Equivalência?</b> As três acima ao mesmo tempo?<br><br>
        Dica: a diagonal está toda marcada. Procure um par (a,b) fora da diagonal cujo espelho (b,a) <em>não</em> exista.
      `,
      // Relação: diagonal + (1,2),(2,3),(1,3),(3,4),(1,4),(2,4),(4,5),(1,5),(2,5),(3,5),(5,6),(1,6),(2,6),(3,6),(4,6)
      // = reflexiva, transitiva, mas NÃO simétrica (ex: (1,2) existe, (2,1) não)
      // → não é equivalência
      initialActive: (() => {
        const diag = [0,1,2,3,4,5].map(i => `${i},${i}`);
        // Pares "para frente" apenas: i < j (sem espelhos)
        const fwd = [];
        for (let i = 0; i < 6; i++)
          for (let j = i+1; j < 6; j++)
            fwd.push(`${i},${j}`);
        return [...diag, ...fwd];
      })(),
      locked: (() => {
        const diag = [0,1,2,3,4,5].map(i => `${i},${i}`);
        const fwd = [];
        for (let i = 0; i < 6; i++)
          for (let j = i+1; j < 6; j++)
            fwd.push(`${i},${j}`);
        return [...diag, ...fwd];
      })(),
      answers: {
        reflexiva:    true,   // diagonal completa ✓
        simetrica:    false,  // (1,2) existe mas (2,1) não ✗
        transitiva:   true,   // todos os atalhos estão presentes ✓
        equivalencia: false,  // não simétrica → não equivalência ✗
      },
      check(active, classifAns) {
        const props = ['reflexiva','simetrica','transitiva','equivalencia'];
        const notAns = props.filter(p => !classifAns[p]);
        if (notAns.length)
          return { ok:false, incomplete:true, msg:'Responda todas as 4 propriedades antes de verificar!' };

        const ans   = this.answers;
        const wrong = props.filter(p => (classifAns[p]==='sim') !== ans[p]);
        if (!wrong.length)
          return { ok:true, msg:'Análise correta! Reflexiva e transitiva, mas não simétrica — portanto não é equivalência.' };

        const labels = { reflexiva:'Reflexiva', simetrica:'Simétrica', transitiva:'Transitiva', equivalencia:'Equivalência' };
        const justif = {
          reflexiva:    ' — Def: ∀a(a ∈ A → (a,a) ∈ R). A diagonal inteira está marcada.',
          simetrica:    ' — Def: ∀a,b((a,b) ∈ R → (b,a) ∈ R). Ex: (1,2) ∈ R mas (2,1) ∉ R — violação!',
          transitiva:   ' — Def: ∀a,b,c((a,b)∈R ∧ (b,c)∈R → (a,c)∈R). Todos os atalhos i→k com i<j<k estão presentes.',
          equivalencia: ' — Requer reflexiva ∧ simétrica ∧ transitiva. Como não é simétrica, não pode ser equivalência.',
        };
        const msgs = wrong.map(p =>
          `<b>${labels[p]}</b>: correto é <b>${ans[p]?'SIM':'NÃO'}</b>${justif[p]||''}`
        );
        return { ok:false, msg:msgs.join('<br>'), wrong };
      },
      highlight() {}
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 8 — CONSTRUIR TRANSITIVA PURA (7×7)
    // Dado um conjunto de pares iniciais (não reflexivos),
    // o aluno APENAS fecha a transitividade — sem reflexiva.
    // Complexidade: grafo com múltiplos caminhos cruzados.
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'transitive_hard',
      name: 'FASE 8 — TRANSITIVIDADE AVANÇADA',
      icon: '⛓️',
      size: 7,
      setA: [1,2,3,4,5,6,7],
      setDisplay: 'A = {1, 2, 3, 4, 5, 6, 7}',
      objective:
        'Complete a relação para que seja APENAS Transitiva — sem precisar ser reflexiva. ' +
        'Os pares fixos formam caminhos cruzados. Feche todas as cadeias transitivas!',
      hint: `
        <b>Transitividade sem Reflexividade</b><br>
        Uma relação pode ser transitiva sem ter a diagonal.<br><br>
        Estratégia: para cada par (a,b) e (b,c) existentes, adicione (a,c).<br>
        Repita com os pares recém-adicionados — novas cadeias podem surgir!<br><br>
        <b>Pares fixos:</b> (1,3),(3,5),(5,7),(2,4),(4,6),(1,4),(2,5)<br>
        Cadeia 1→3→5 → falta (1,5). Cadeia 1→3→5→7 → falta (1,7). E assim por diante!
      `,
      // Pares iniciais [0-indexed]:
      // (0,2),(2,4),(4,6),(1,3),(3,5),(0,3),(1,4)
      // Fecho esperado (além dos iniciais):
      // (0,2)+(2,4)→(0,4)
      // (0,4)+(4,6)→(0,6)
      // (0,2)+(2,4)+(4,6) → (0,4),(0,6)
      // (2,4)+(4,6)→(2,6)
      // (1,3)+(3,5)→(1,5)
      // (0,3)+(3,5)→(0,5)
      // (0,5)+(5,?)  — não há (5,x) então para
      // (1,4)+(4,6)→(1,6)
      // (0,3)+(3,5)→(0,5) já calculado
      // (1,3)+(3,5)→(1,5) já calculado
      initialActive: ['0,2','2,4','4,6','1,3','3,5','0,3','1,4'],
      locked:        ['0,2','2,4','4,6','1,3','3,5','0,3','1,4'],

      check(active) {
        // Calcular fecho transitivo correto
        const cur = new Set(active);
        const needed = new Map();
        let changed = true;
        while (changed) {
          changed = false;
          for (const p1 of [...cur]) {
            const [a,b1] = p1.split(',').map(Number);
            for (const p2 of [...cur]) {
              const [b2,c] = p2.split(',').map(Number);
              if (b1 === b2) {
                const need = key(a,c);
                if (!cur.has(need)) {
                  needed.set(need, { need, p1, p2 });
                  cur.add(need);
                  changed = true;
                }
              }
            }
          }
        }
        const realMissing = [...needed.values()].filter(m => !active.has(m.need));
        const lockedSet = new Set(['0,2','2,4','4,6','1,3','3,5','0,3','1,4']);
        const extra = [...active].filter(k => !cur.has(k) && !lockedSet.has(k));

        if (!realMissing.length && !extra.length)
          return { ok:true, msg:'Fantástico! Todas as cadeias transitivas estão fechadas!' };

        const msgs = [];
        if (realMissing.length) {
          const list = realMissing.slice(0,5).map(({ p1, p2, need }) => {
            const [ai,bi]=p1.split(',').map(Number), [bj,cj]=p2.split(',').map(Number), [ni,nj]=need.split(',').map(Number);
            return `${ps(ai,bi)} + ${ps(bj,cj)} → falta <b>${ps(ni,nj)}</b>`;
          });
          msgs.push(list.join('<br>'));
          if (realMissing.length > 5) msgs.push(`…e mais ${realMissing.length - 5} pares`);
        }
        if (extra.length) {
          const list = extra.map(k => { const [i,j]=k.split(',').map(Number); return ps(i,j); });
          msgs.push(`Pares que não derivam do fecho: <b>${list.join(', ')}</b>`);
        }
        return { ok:false, msg:msgs.join('<br>'), missing:realMissing.map(m=>m.need), extra };
      },

      highlight(active, r) {
        const lockedSet = new Set(['0,2','2,4','4,6','1,3','3,5','0,3','1,4']);
        const misSet  = new Set(r.missing||[]);
        const extraSet = new Set(r.extra||[]);
        // Pares que participam de cadeias violadas
        const bad = new Set();
        for (const p1 of active) {
          const [a,b1] = p1.split(',').map(Number);
          for (const p2 of active) {
            const [b2,c] = p2.split(',').map(Number);
            if (b1===b2 && !active.has(key(a,c))) { bad.add(p1); bad.add(p2); }
          }
        }
        for (const k of active) {
          if (lockedSet.has(k)) { markCell(k, bad.has(k) ? 'f-err' : 'f-ok'); continue; }
          if (extraSet.has(k))  { markCell(k,'f-err'); continue; }
          markCell(k, bad.has(k) ? 'f-err' : 'f-ok');
        }
        misSet.forEach(k => markCell(k,'f-miss'));
      }
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 9 — CLASSIFICAÇÃO DIFÍCIL (8×8)
    // Relação que é de equivalência — todas as 4 propriedades SIM.
    // A pegadinha: o aluno precisa verificar transitiva em 8 elementos.
    // Relação: mesma classe {1,2,3,4} e outra {5,6,7,8} → equivalência.
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'classify_equiv',
      name: 'FASE 9 — CLASSIFICAÇÃO FINAL',
      icon: '🔭',
      size: 8,
      setA: [1,2,3,4,5,6,7,8],
      setDisplay: 'A = {1, 2, 3, 4, 5, 6, 7, 8}',
      objective:
        'Analise esta relação 8×8 e classifique as 4 propriedades. ' +
        'Cuidado — desta vez a relação PODE ser de equivalência. Verifique cada propriedade com rigor!',
      hint: `
        <b>Reconhecendo uma Equivalência</b><br>
        Esta relação foi construída a partir da partição {1,2,3,4} e {5,6,7,8}.<br><br>
        (a,b) ∈ R ↔ a e b estão no mesmo grupo.<br><br>
        • <b>Reflexiva?</b> Todo (a,a) está marcado? Sim — diagonal completa.<br>
        • <b>Simétrica?</b> Se (1,2) está, (2,1) também está? Sim — blocos simétricos.<br>
        • <b>Transitiva?</b> Se (1,2) e (2,3), então (1,3)? Sim — dentro do mesmo bloco.<br>
        • <b>Equivalência?</b> As três — então sim!
      `,
      // Partição: {0,1,2,3} e {4,5,6,7} → relação de equivalência
      initialActive: (() => {
        const pairs = [];
        [[0,1,2,3],[4,5,6,7]].forEach(cls => {
          for (const a of cls) for (const b of cls) pairs.push(`${a},${b}`);
        });
        return pairs;
      })(),
      locked: (() => {
        const pairs = [];
        [[0,1,2,3],[4,5,6,7]].forEach(cls => {
          for (const a of cls) for (const b of cls) pairs.push(`${a},${b}`);
        });
        return pairs;
      })(),
      answers: {
        reflexiva:    true,
        simetrica:    true,
        transitiva:   true,
        equivalencia: true,
      },
      check(active, classifAns) {
        const props = ['reflexiva','simetrica','transitiva','equivalencia'];
        const notAns = props.filter(p => !classifAns[p]);
        if (notAns.length)
          return { ok:false, incomplete:true, msg:'Responda todas as 4 propriedades antes de verificar!' };

        const ans   = this.answers;
        const wrong = props.filter(p => (classifAns[p]==='sim') !== ans[p]);
        if (!wrong.length)
          return { ok:true, msg:'Análise perfeita! Esta relação É de equivalência — ela representa a partição {1,2,3,4} | {5,6,7,8}!' };

        const labels = { reflexiva:'Reflexiva', simetrica:'Simétrica', transitiva:'Transitiva', equivalencia:'Equivalência' };
        const justif = {
          reflexiva:    ' — Def: ∀a(a ∈ A → (a,a) ∈ R). Toda nave se comunica consigo mesma ✓',
          simetrica:    ' — Def: ∀a,b((a,b) ∈ R → (b,a) ∈ R). Cada par tem seu espelho dentro do bloco ✓',
          transitiva:   ' — Def: ∀a,b,c((a,b)∈R ∧ (b,c)∈R → (a,c)∈R). Dentro de cada bloco, todos os atalhos existem ✓',
          equivalencia: ' — Def: R é reflexiva ∧ simétrica ∧ transitiva. As três são satisfeitas — é de equivalência! ✓',
        };
        const msgs = wrong.map(p =>
          `<b>${labels[p]}</b>: correto é <b>${ans[p]?'SIM':'NÃO'}</b>${justif[p]||''}`
        );
        return { ok:false, msg:msgs.join('<br>'), wrong };
      },
      highlight() {}
    }),

    // ──────────────────────────────────────────────────────────
    // FASE 10 — DESAFIO FINAL: PARTIÇÃO → EQUIVALÊNCIA (10×10)
    // Partição pedida: {1,2,3}, {4,5,6}, {7,8}, {9,10}
    // Marcar EXATAMENTE os pares dentro de cada classe (26 pares).
    // ──────────────────────────────────────────────────────────
    new Phase({
      id: 'final_challenge',
      name: 'FASE 10 — DESAFIO FINAL',
      icon: '🏆',
      size: 10,
      setA: [1,2,3,4,5,6,7,8,9,10],
      setDisplay: 'A = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}',
      objective:
        'DESAFIO FINAL! Monte a relação de equivalência da partição ' +
        'π = { {1,2,3}, {4,5,6}, {7,8}, {9,10} }. ' +
        'Marque EXATAMENTE os pares (a,b) onde a e b estão na mesma classe. São 26 pares no total!',
      hint: `
        <b>Partição → Relação de Equivalência</b><br>
        Cada partição define: (a,b) ∈ R ↔ a e b estão na mesma classe.<br><br>
        <b>Suas classes:</b><br>
        • {1,2,3} → 9 pares: (1,1),(1,2),(1,3),(2,1),(2,2),(2,3),(3,1),(3,2),(3,3)<br>
        • {4,5,6} → 9 pares: idem para 4,5,6<br>
        • {7,8} → 4 pares: (7,7),(7,8),(8,7),(8,8)<br>
        • {9,10} → 4 pares: (9,9),(9,10),(10,9),(10,10)<br><br>
        <b>Total: 26 pares.</b> Elementos de classes diferentes NÃO se relacionam!
      `,
      initialActive: [],
      locked: [],
      _classes: [[0,1,2],[3,4,5],[6,7],[8,9]],

      check(active) {
        const expected = new Set();
        for (const cls of this._classes)
          for (const a of cls)
            for (const b of cls)
              expected.add(key(a,b));

        const missing = [...expected].filter(k => !active.has(k));
        const extra   = [...active].filter(k => !expected.has(k));

        if (!missing.length && !extra.length)
          return { ok:true, msg:'🏆 CAMPEÃO! Missão cumprida! 26 pares, 4 classes de equivalência, relação perfeita!' };

        const msgs = [];
        if (missing.length) {
          const list = missing.slice(0,5).map(k=>{ const[i,j]=k.split(',').map(Number); return ps(i,j); });
          msgs.push(`Faltam ${missing.length} pares: <b>${list.join(', ')}${missing.length>5?'…':''}</b>`);
        }
        if (extra.length) {
          const list = extra.slice(0,5).map(k=>{ const[i,j]=k.split(',').map(Number); return ps(i,j); });
          msgs.push(`${extra.length} pares incorretos (classes diferentes!): <b>${list.join(', ')}${extra.length>5?'…':''}</b>`);
        }
        return { ok:false, msg:msgs.join('<br>'), missing, extra };
      },

      highlight(active, r) {
        const expected = new Set();
        for (const cls of this._classes)
          for (const a of cls)
            for (const b of cls)
              expected.add(key(a,b));
        const misSet  = new Set(r.missing||[]);
        const extraSet = new Set(r.extra||[]);
        for (const k of active) markCell(k, extraSet.has(k) ? 'f-err' : 'f-ok');
        misSet.forEach(k => markCell(k,'f-miss'));
      }
    }),

  ]; // fim PHASES

  // ════════════════════════════════════════════════════════════════
  //  UTILITÁRIOS
  // ════════════════════════════════════════════════════════════════

  function markCell(k, cls) {
    const el = document.querySelector(`.cell[data-key="${k}"]`);
    if (!el) return;
    el.classList.remove('f-ok','f-err','f-miss');
    el.classList.add(cls);
  }

  function genBubbles() {
    const c = document.getElementById('bubbles');
    if (!c) return;
    c.innerHTML = '';
    for (let i=0;i<18;i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const sz = Math.random()*18+6;
      b.style.cssText = `left:${Math.random()*100}%;bottom:-${sz}px;width:${sz}px;height:${sz}px;`
        + `animation-duration:${(Math.random()*10+8).toFixed(1)}s;`
        + `animation-delay:${(Math.random()*8).toFixed(1)}s;`;
      c.appendChild(b);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  EFEITOS DE BOMBA/EXPLOSÃO — Tema Batalha Naval 💣
  // ════════════════════════════════════════════════════════════════

  function createBombEffect(clientX, clientY, cellEl) {
    // Flash radial de explosão
    const flash = document.createElement('div');
    flash.className = 'blast-flash';
    flash.style.left = (clientX - 15) + 'px';
    flash.style.top = (clientY - 15) + 'px';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);

    // Anel de pulso/luz expandindo
    const pulse = document.createElement('div');
    pulse.className = 'light-pulse';
    pulse.style.left = (clientX - 10) + 'px';
    pulse.style.top = (clientY - 10) + 'px';
    document.body.appendChild(pulse);
    setTimeout(() => pulse.remove(), 600);

    // Tremor do quadrado
    if (cellEl) {
      cellEl.classList.add('shake');
      setTimeout(() => cellEl.classList.remove('shake'), 400);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  NAVEGAÇÃO
  // ════════════════════════════════════════════════════════════════

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById(`screen-${name}`).classList.add('active');
    if (name==='home')         genBubbles();
    if (name==='instructions') setTimeout(buildMiniBoards, 50);
  }

  // ════════════════════════════════════════════════════════════════
  //  JOGO
  // ════════════════════════════════════════════════════════════════

  function startGame() {
    Audio.init();
    state = { phase:0, score:0, history:[], active:new Set(), classifAns:{}, checked:false, attempts:0, hintOpen:false };
    showScreen('game');
    // Mostrar intro narrativa antes de carregar a primeira fase
    Intro.show(() => {
      loadPhase(0);
      renderPhaseDots();
    });
  }

  function restartGame() { startGame(); }

  function loadPhase(idx) {
    const ph = PHASES[idx];
    N = ph.size;
    SET_A = ph.setA;
    state.active    = new Set(ph.initialActive);
    state.classifAns = {};
    state.checked   = false;
    state.attempts  = 0;
    state.hintOpen  = false;

    document.getElementById('hud-phase').textContent     = `FASE ${idx+1}/${PHASES.length}`;
    document.getElementById('mis-icon').textContent      = ph.icon;
    document.getElementById('mis-name').textContent      = ph.name;
    document.getElementById('mis-obj').textContent       = ph.objective;
    document.getElementById('set-display').textContent   = ph.setDisplay || 'A = {1, 2, 3, 4}';

    hideFeedback();
    document.getElementById('hint-box').style.display   = 'none';
    document.getElementById('btn-next').style.display   = 'none';
    document.getElementById('btn-check').disabled       = false;

    // Fase de classificação = qualquer fase com respostas (answers)
    const isClassify = !!ph.answers;
    document.getElementById('classif-panel').style.display = isClassify ? 'block' : 'none';
    if (isClassify) buildClassification(ph);

    buildBoard(ph);
    renderPhaseDots();

    // Mostrar diálogo do Willy para a fase (só narrativa, não bloqueia o botão)
    const dialogs = WILLY_DIALOGS[ph.id];
    if (dialogs && dialogs.intro && dialogs.intro.length) {
      Dialog.show(dialogs.intro);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  TABULEIRO — linhas e colunas com números 1,2,3,4
  // ════════════════════════════════════════════════════════════════

  function buildBoard(ph) {
    const grid = document.getElementById('board-grid');
    grid.innerHTML = '';
    const size = N + 1;
    grid.dataset.n = N; // usado pelo CSS para reduzir células em grids grandes
    grid.style.gridTemplateColumns = `repeat(${size}, var(--cell))`;
    grid.style.gridTemplateRows    = `repeat(${size}, var(--cell))`;

    for (let row=0; row<size; row++) {
      for (let col=0; col<size; col++) {
        const cell = document.createElement('div');

        if (row===0 && col===0) {
          // Canto: indicador de eixos
          cell.className = 'cell header';
          cell.innerHTML = `<span class="cell-header-val" style="font-size:0.3rem;opacity:0.35;line-height:1.2">a↓<br>b→</span>`;

        } else if (row===0) {
          // Cabeçalho de COLUNA — valores de b (1,2,3,4)
          cell.className = 'cell header';
          cell.innerHTML = `<span class="cell-header-val">${SET_A[col-1]}</span>`;

        } else if (col===0) {
          // Cabeçalho de LINHA — valores de a (1,2,3,4)
          cell.className = 'cell header';
          cell.innerHTML = `<span class="cell-header-val">${SET_A[row-1]}</span>`;

        } else {
          const i = row - 1; // índice de a
          const j = col - 1; // índice de b
          const k = key(i,j);
          const isLocked = ph.locked && ph.locked.includes(k);

          cell.className = `cell data${isLocked?' locked':''}`;
          cell.dataset.key = k;

          const anchor = document.createElement('div');
          anchor.className = 'cell-anchor';
          anchor.textContent = '⚓';

          const label = document.createElement('div');
          label.className = 'cell-label';
          label.textContent = `${val(i)},${val(j)}`; // exibe "1,2" não "1,B"

          cell.appendChild(anchor);
          cell.appendChild(label);

          if (state.active.has(k)) cell.classList.add('on');
          if (!isLocked) cell.addEventListener('click', () => onCellClick(k));
        }

        grid.appendChild(cell);
      }
    }
  }

  function onCellClick(k) {
    if (state.checked) return;
    state.active.has(k) ? state.active.delete(k) : state.active.add(k);
    const el = document.querySelector(`.cell[data-key="${k}"]`);
    if (el) {
      el.classList.remove('f-ok','f-err','f-miss');
      el.classList.toggle('on', state.active.has(k));
      
      // Efeito de Flash + Tremor quando clica
      if (state.active.has(k)) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        createBombEffect(centerX, centerY, el);
      }
    }
    hideFeedback();
  }

  // ════════════════════════════════════════════════════════════════
  //  CLASSIFICAÇÃO (Fase 4)
  // ════════════════════════════════════════════════════════════════

  function buildClassification(ph) {
    const container = document.getElementById('classif-items');
    container.innerHTML = '';
    const props = [
      { key:'reflexiva',    icon:'🔁', label:'REFLEXIVA' },
      { key:'simetrica',    icon:'🔄', label:'SIMÉTRICA' },
      { key:'transitiva',   icon:'⛓',  label:'TRANSITIVA' },
      { key:'equivalencia', icon:'⭐', label:'EQUIVALÊNCIA' },
    ];
    props.forEach(p => {
      const item = document.createElement('div');
      item.className = 'classif-item';
      item.id = `ci-${p.key}`;

      const name = document.createElement('div');
      name.className = 'ci-prop';
      name.textContent = `${p.icon} ${p.label}`;

      const btns = document.createElement('div');
      btns.className = 'ci-btns';

      ['sim','nao'].forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'ci-btn';
        btn.textContent = v==='sim'?'SIM':'NÃO';
        btn.addEventListener('click', () => {
          if (state.checked) return;
          state.classifAns[p.key] = v;
          btns.querySelectorAll('.ci-btn').forEach(b=>b.classList.remove('sel-sim','sel-nao'));
          btn.classList.add(v==='sim'?'sel-sim':'sel-nao');
          hideFeedback();
        });
        btns.appendChild(btn);
      });

      item.appendChild(name);
      item.appendChild(btns);
      container.appendChild(item);
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  VERIFICAÇÃO
  // ════════════════════════════════════════════════════════════════

  function checkAnswer() {
    const ph = PHASES[state.phase];
    state.attempts++;
    let result;

    if (ph.answers) {  // qualquer fase de classificação (fase 4 e fase 8)
      result = ph.check(state.active, state.classifAns);
      if (!result.incomplete) {
        state.checked = true;
        highlightClassification(ph, result);
      }
    } else {
      result = ph.check(state.active);
      state.checked = true;
      ph.highlight(state.active, result);
    }

    showFeedback(result);

    if (result.ok) {
      const pts = state.attempts===1 ? 30 : state.attempts===2 ? 20 : 10;
      state.score += pts;
      updateScore(pts);
      state.history.push({ phase:state.phase, ok:true, pts, attempts:state.attempts });
      document.getElementById('btn-check').disabled = true;
      document.getElementById('btn-next').style.display = 'inline-flex';
      renderPhaseDots();
      // Willy comemora
      const willyD = WILLY_DIALOGS[ph.id];
      if (willyD && willyD.success) setTimeout(() => Dialog.show([willyD.success]), 400);
    } else if (!result.incomplete) {
      state.checked = false;
      state.history.push({ phase:state.phase, ok:false, pts:0, attempts:state.attempts });
      // Willy dá dica de erro (apenas na primeira falha de cada fase)
      const willyD2 = WILLY_DIALOGS[ph.id];
      if (willyD2 && willyD2.fail && state.attempts === 1) setTimeout(() => Dialog.show([willyD2.fail]), 300);
    }
  }

  function highlightClassification(ph, r) {
    const props = ph.answers ? Object.keys(ph.answers) : ['reflexiva','simetrica','transitiva','equivalencia'];
    props.forEach(p => {
      const item = document.getElementById(`ci-${p}`);
      if (!item) return;
      item.classList.remove('res-ok','res-err');
      item.classList.add((state.classifAns[p]==='sim') === ph.answers[p] ? 'res-ok' : 'res-err');
    });
  }

  function showFeedback(r) {
    const box = document.getElementById('feedback-box');
    const ico = document.getElementById('fb-ico');
    const txt = document.getElementById('fb-txt');
    box.classList.remove('fb-success','fb-error','fb-warn');
    box.style.display = 'flex';
    if (r.ok) {
      box.classList.add('fb-success');
      ico.src = 'assets/UI_Flat_IconCheck01a.png';
      ico.alt = 'Sucesso';
    } else if (r.incomplete) {
      box.classList.add('fb-warn');
      ico.src = 'assets/UI_Flat_IconCross01a.png';
      ico.alt = 'Aviso';
    } else {
      box.classList.add('fb-error');
      ico.src = 'assets/UI_Flat_IconCross01a.png';
      ico.alt = 'Erro';
    }
    txt.innerHTML = r.msg;
  }

  function hideFeedback() {
    document.getElementById('feedback-box').style.display = 'none';
  }

  function toggleHint() {
    const box     = document.getElementById('hint-box');
    const content = document.getElementById('hint-content');
    if (!state.hintOpen) {
      content.innerHTML = PHASES[state.phase].hint;
      box.style.display = 'block';
      state.hintOpen = true;
    } else {
      box.style.display = 'none';
      state.hintOpen = false;
    }
  }

  function nextPhase() {
    if (state.phase + 1 >= PHASES.length) { showFinalScreen(); return; }
    state.phase++;
    loadPhase(state.phase);
  }

  function updateScore(added) {
    const el = document.getElementById('score-disp');
    el.textContent = String(state.score).padStart(3,'0');
    if (added > 0) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }

  function renderPhaseDots() {
    const wrap = document.getElementById('phase-dots');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (let i=0;i<PHASES.length;i++) {
      const d = document.createElement('div');
      d.className = 'pdot';
      const ok = state.history.filter(h=>h.phase===i).some(h=>h.ok);
      if      (i < state.phase && ok)  d.classList.add('done');
      else if (i < state.phase && !ok) d.classList.add('fail');
      else if (i === state.phase)      d.classList.add('curr');
      wrap.appendChild(d);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  MINI BOARDS NAS INSTRUÇÕES (também com números)
  // ════════════════════════════════════════════════════════════════

  function buildMiniBoards() {
    const examples = {
      reflex: (i,j) => i===j,
      simex:  (i,j) => (i===0&&j===0)||(i===1&&j===1)||(i===2&&j===2)||
                        (i===0&&j===1)||(i===1&&j===0),
      trans:  (i,j) => (i===0&&j===1)||(i===1&&j===2)||(i===0&&j===2),
      equiv:  (i,j) => (i===0&&j===0)||(i===1&&j===1)||(i===2&&j===2)||
                        (i===0&&j===1)||(i===1&&j===0)||
                        (i===1&&j===2)||(i===2&&j===1)||
                        (i===0&&j===2)||(i===2&&j===0),
    };

    document.querySelectorAll('.mini-board[data-ex]').forEach(el => {
      const fn = examples[el.dataset.ex];
      if (!fn) return;
      const n = 3;
      el.style.gridTemplateColumns = `repeat(${n+1}, 20px)`;
      el.style.gridTemplateRows    = `repeat(${n+1}, 20px)`;
      el.innerHTML = '';
      for (let r=0;r<=n;r++) {
        for (let c=0;c<=n;c++) {
          const mc = document.createElement('div');
          if      (r===0 && c===0) { mc.className='mc mh'; }
          else if (r===0)          { mc.className='mc mh'; mc.textContent=c; }      // cabeçalho coluna: número
          else if (c===0)          { mc.className='mc mh'; mc.textContent=r; }      // cabeçalho linha: número
          else {
            mc.className = fn(r-1,c-1) ? 'mc mon' : 'mc';
            mc.textContent = fn(r-1,c-1) ? '⚓' : '';
          }
          el.appendChild(mc);
        }
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  TELA FINAL
  // ════════════════════════════════════════════════════════════════

  function showFinalScreen() {
    document.getElementById('final-score').textContent = String(state.score).padStart(3,'0');

    let rankIco, rankLbl;
    if      (state.score >= 260) { rankIco='🌟'; rankLbl='ALMIRANTE DAS RELAÇÕES'; }
    else if (state.score >= 200) { rankIco='⭐'; rankLbl='COMANDANTE MATEMÁTICO'; }
    else if (state.score >= 140) { rankIco='🔵'; rankLbl='TENENTE DE PRIMEIRA'; }
    else if (state.score >= 80)  { rankIco='🟡'; rankLbl='SARGENTO MATEMÁTICO'; }
    else                         { rankIco='🔴'; rankLbl='CADETE EM TREINAMENTO'; }
    document.getElementById('rank-ico').textContent = rankIco;
    document.getElementById('rank-lbl').textContent = rankLbl;

    const sum = document.getElementById('final-sum');
    sum.innerHTML = '';
    PHASES.forEach((ph, i) => {
      const ok  = state.history.filter(h=>h.phase===i).some(h=>h.ok);
      const pts = state.history.filter(h=>h.phase===i).reduce((s,h)=>s+h.pts,0);
      const row = document.createElement('div');
      row.className = 'fsr';
      row.innerHTML = `
        <span class="fsr-name">${ph.icon} ${ph.name.replace(/FASE \d+ — /,'')}</span>
        <span class="fsr-pts ${ok?'ok':'fail'}">${ok?'+'+pts+' pts ✓':'não concluída'}</span>
      `;
      sum.appendChild(row);
    });

    showScreen('final');

    setTimeout(() => {
      if (state.score >= 200) {
        // Vitória: coordenadas decifradas
        Dialog.show([
          {
            text: "...Comandante. Acabei de processar os sinais. As coordenadas estão aqui.",
            mood: 'idle',
          },
          {
            text: "Latitude 34° 47' N, Longitude 28° 12' O. O quartel-general da Armada GAR fica no Arquipélago de Rakatan.",
            mood: 'talk',
          },
          {
            text: "Você decifrou todos os padrões com precisão. Sem você, jamais chegaríamos lá. Foi uma honra navegar ao seu lado, Comandante.",
            mood: 'happy',
          },
          {
            text: "...Os canhões já estão apontados. É hora de terminar isso.",
            mood: 'idle',
          },
        ]);
      } else {
        // Derrota: interceptações insuficientes
        Dialog.show([
          {
            text: "...Comandante. Os sinais... não foram suficientes. Não conseguimos decifrar as coordenadas completas.",
            mood: 'blink',
          },
          {
            text: "A Armada GAR percebeu que estava sendo monitorada. Eles mudaram os padrões de comunicação. Precisaremos tentar novamente.",
            mood: 'idle',
          },
          {
            text: "Não desanime. Cada padrão decifrado nos ensina algo novo. Na próxima operação, estaremos mais preparados.",
            mood: 'talk',
          },
        ]);
      }
    }, 800); // pequeno delay para a tela final aparecer primeiro
  }

  // ════════════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => showScreen('home'));

  return { showScreen, startGame, restartGame, checkAnswer, nextPhase, toggleHint };

})();