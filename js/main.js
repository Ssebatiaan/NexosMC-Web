// Web de Nexos MC: desplazamiento suave (Lenis), animaciones al bajar (GSAP + ScrollTrigger), noticias, descarga del
// launcher (ultima version de GitHub) y la barra de la semana con la hora de Colombia.
(() => {
  const REPO = "Ssebatiaan/Nexos-Launcher";
  const STABLE_EXE = "Nexos-Launcher-Setup.exe";
  const NEWS_URL = `https://raw.githubusercontent.com/${REPO}/pack/noticias.json`;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.registerPlugin(ScrollTrigger);
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------------------------------------------------------------- desplazamiento suave
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    window.__lenis = lenis; // para las capturas de prueba
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Enlaces internos (#seccion) con el mismo desplazamiento suave
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -60, duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Barra de arriba: fondo al bajar un poco, se esconde al bajar y vuelve al subir
  const nav = document.getElementById("nav");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    nav.classList.toggle("hidden", y > 300 && y > lastY);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------------------------------------------------------------- cielo con estrellas (portada)
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let heroVisible = true;
  const colors = ["255,255,255", "217,184,255", "62,230,216", "169,107,255"];
  function resizeStars() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((canvas.clientWidth * canvas.clientHeight) / 6500);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight * 0.8,
      r: Math.random() < 0.12 ? 1.8 : Math.random() * 1.1 + 0.3,
      c: colors[Math.random() < 0.7 ? 0 : 1 + Math.floor(Math.random() * 3)],
      p: Math.random() * Math.PI * 2,
      s: 0.5 + Math.random() * 1.5,
    }));
  }
  function drawStars(t) {
    if (heroVisible) {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (const s of stars) {
        const a = reduce ? 0.8 : 0.35 + 0.65 * Math.abs(Math.sin(s.p + (t / 1000) * s.s));
        ctx.fillStyle = `rgba(${s.c},${a})`;
        ctx.fillRect(s.x, s.y, s.r, s.r); // cuadrados: estrellas "de pixel"
      }
    }
    if (!reduce) requestAnimationFrame(drawStars);
  }
  resizeStars();
  requestAnimationFrame(drawStars);
  window.addEventListener("resize", resizeStars);
  ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onToggle: (st) => (heroVisible = st.isActive) });

  // ---------------------------------------------------------------- portada: entrada y parallax al bajar
  if (!reduce) {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".crystal-wrap", { opacity: 0, scale: 0.6, duration: 1.6 })
      .from(".hero-logo", { opacity: 0, y: 40, scale: 0.92, duration: 1.1 }, 0.2)
      .from(".hero-tagline", { opacity: 0, y: 30, duration: 0.9 }, 0.55)
      .from(".hero-actions .btn", { opacity: 0, y: 24, stagger: 0.12, duration: 0.8 }, 0.75)
      .from([".hero-note", ".scroll-hint"], { opacity: 0, duration: 0.8 }, 1.1)
      .from(".hero-city", { yPercent: 25, opacity: 0, duration: 1.6 }, 0);

    const hero = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero-content", { yPercent: -35, opacity: 0, ease: "none", scrollTrigger: hero });
    gsap.to(".crystal-wrap", { yPercent: 0, y: 180, scale: 1.6, opacity: 0.2, ease: "none", scrollTrigger: hero });
    gsap.to(".hero-city", { yPercent: -18, ease: "none", scrollTrigger: hero });
    gsap.to(".hero-glow", { scale: 1.5, opacity: 0.4, ease: "none", scrollTrigger: hero });
  }

  // ---------------------------------------------------------------- "Que es": las palabras se encienden al bajar
  const aboutText = document.getElementById("about-text");
  aboutText.innerHTML = aboutText.textContent.trim().split(/\s+/)
    .map((w) => `<span class="w">${w}</span>`).join(" ");
  const words = aboutText.querySelectorAll(".w");
  if (!reduce) {
    gsap.to(words, {
      opacity: 1,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: { trigger: ".about", start: "top 70%", end: "center 45%", scrub: true },
    });
  }
  // Numeros que cuentan
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduce) {
      el.textContent = end + suffix;
      return;
    }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate: () => (el.textContent = Math.round(obj.v) + suffix),
    });
  });

  // ---------------------------------------------------------------- caracteristicas: de lado en ordenador
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const track = document.getElementById("features-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    const scroll = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".features",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    // Cada captura se endereza al pasar por el centro
    track.querySelectorAll(".feature-shot").forEach((shot) => {
      gsap.fromTo(shot, { rotateY: -18, scale: 0.92 }, {
        rotateY: 0,
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: shot, containerAnimation: scroll, start: "left right", end: "center center", scrub: true },
      });
    });
  });
  mm.add("(max-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".feature").forEach((card) => {
      gsap.from(card, { opacity: 0, y: 60, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%", once: true } });
    });
  });

  // ---------------------------------------------------------------- la semana (hora de Colombia, UTC-5 sin cambio de hora)
  const DAY_MS = 24 * 3600 * 1000;
  function weekInfo() {
    const bogota = new Date(Date.now() - 5 * 3600 * 1000); // los campos UTC de esta fecha = hora de Bogota
    const day = (bogota.getUTCDay() + 6) % 7; // lunes = 0 ... domingo = 6
    const msToday = bogota.getUTCHours() * 3600e3 + bogota.getUTCMinutes() * 60e3 + bogota.getUTCSeconds() * 1e3;
    const sinceMonday = day * DAY_MS + msToday;
    const raidStart = 5 * DAY_MS; // sabado 00:00
    const raid = sinceMonday >= raidStart;
    const left = raid ? 7 * DAY_MS - sinceMonday : raidStart - sinceMonday;
    return { fraction: sinceMonday / (7 * DAY_MS), raid, left };
  }
  function fmt(ms) {
    const d = Math.floor(ms / DAY_MS);
    const h = Math.floor((ms % DAY_MS) / 3600e3);
    const m = Math.floor((ms % 3600e3) / 60e3);
    return d > 0 ? `${d} d ${h} h` : h > 0 ? `${h} h ${m} min` : `${m} min`;
  }
  const now = document.getElementById("week-now");
  const status = document.getElementById("week-status");
  function updateWeek() {
    const w = weekInfo();
    now.style.left = (w.fraction * 100).toFixed(2) + "%";
    status.innerHTML = w.raid
      ? `⚔️ <strong>¡Raideo abierto!</strong> Las bases vuelven a estar protegidas en ${fmt(w.left)}.`
      : `🛡️ Bases protegidas. El próximo raideo empieza en <strong>${fmt(w.left)}</strong>.`;
  }
  updateWeek();
  setInterval(updateWeek, 30_000);
  if (!reduce) {
    gsap.from(".day", {
      scaleY: 0,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".week-bar", start: "top 80%", once: true },
    });
    gsap.to(now, { opacity: 1, duration: 0.6, delay: 0.9, scrollTrigger: { trigger: ".week-bar", start: "top 80%", once: true } });
  } else {
    now.style.opacity = 1;
  }

  // ---------------------------------------------------------------- noticias (las mismas del launcher)
  const grid = document.getElementById("news-grid");
  function dateText(iso) {
    const d = new Date(iso + "T12:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
  }
  fetch(NEWS_URL, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((news) => {
      grid.innerHTML = "";
      if (!news.length) {
        grid.innerHTML = '<p class="news-empty">Sin noticias por ahora.</p>';
        return;
      }
      for (const n of news.slice(0, 6)) {
        const card = document.createElement("article");
        card.className = "news-card";
        card.innerHTML = '<div class="news-meta"><span class="date"></span></div><h3></h3><p></p>';
        card.querySelector(".date").textContent = dateText(n.fecha);
        if (n.etiqueta) {
          const tag = document.createElement("span");
          tag.className = "news-tag";
          tag.textContent = n.etiqueta;
          card.querySelector(".news-meta").appendChild(tag);
        }
        card.querySelector("h3").textContent = n.titulo;
        card.querySelector("p").textContent = n.texto;
        grid.appendChild(card);
      }
      ScrollTrigger.refresh();
      if (!reduce) {
        gsap.from(".news-card", { opacity: 0, y: 40, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: grid, start: "top 85%", once: true } });
      }
    })
    .catch(() => (grid.innerHTML = '<p class="news-empty">No se pudieron cargar las noticias. Míralas en el launcher o en el Discord.</p>'));

  // ---------------------------------------------------------------- descarga directa (ultima version publicada)
  const fallback = `https://github.com/${REPO}/releases/latest/download/${STABLE_EXE}`;
  document.querySelectorAll(".download-link").forEach((a) => (a.href = fallback));
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((release) => {
      const exe = release.assets.find((a) => a.name === STABLE_EXE) ?? release.assets.find((a) => /\.exe$/i.test(a.name));
      if (!exe) return;
      document.querySelectorAll(".download-link").forEach((a) => (a.href = exe.browser_download_url));
      const mb = Math.round(exe.size / 1024 / 1024);
      const version = release.tag_name.replace(/^v/, "");
      document.getElementById("download-version").textContent = `Versión ${version} · ${mb} MB · Windows 10 y 11`;
      document.querySelectorAll(".download-meta").forEach((s) => (s.textContent = `v${version} · Windows 10 / 11 · gratis`));
    })
    .catch(() => {});

  // ---------------------------------------------------------------- apariciones generales al bajar
  if (!reduce) {
    gsap.utils.toArray(".eyebrow, section h2:not(.reveal-words), .steps li, .download-box, .week-legend").forEach((el) => {
      gsap.from(el, { opacity: 0, y: 36, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
