# Web de Nexos MC

Web de https://nexosmc.network (Cloudflare Pages): portada con descarga directa del Nexos Launcher, qué es el servidor,
características, la semana (bases protegidas / raideo, hora de Colombia), noticias y cómo jugar.

- HTML, CSS y JavaScript sin compilar. Animaciones con GSAP 3.15 + ScrollTrigger (licencia estándar gratuita de GSAP)
  y desplazamiento suave con Lenis 1.3.26 (MIT), copiados en `vendor/`.
- Con «reducir movimiento» del sistema (Windows: Efectos de animación apagados) se anima igual (decisión del dueño:
  casi siempre se apaga por rendimiento); solo se quitan el desplazamiento con inercia y el giro continuo del cristal.
- Noticias: `noticias.json` de la rama `pack` del repo del launcher (sale de `client-pack/noticias.json` del proyecto del
  servidor al publicar el modpack).
- Descarga: la última Release del launcher (`Nexos-Launcher-Setup.exe`, nombre fijo que sube `npm run publicar`).
- Probar en el PC: `python -m http.server 8765` en esta carpeta y abrir http://127.0.0.1:8765
