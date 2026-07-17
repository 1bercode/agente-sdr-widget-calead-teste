(function () {
  "use strict";

  var currentScript = document.currentScript;
  if (!currentScript || !currentScript.src) {
    console.error("[calead] embed.js precisa ser carregado via <script src>.");
    return;
  }

  var scriptUrl = new URL(currentScript.src);
  var baseUrl = scriptUrl.origin;

  var agentId = currentScript.getAttribute("data-agent-id");
  if (!agentId) {
    console.error("[calead] embed.js precisa de data-agent-id no <script>.");
    return;
  }

  // Geometria fixa — espelha src/lib/widget-protocol.ts (WIDGET_BAR / PANEL).
  // Host é dono da altura; o iframe não redimensiona no hover.
  var BAR_IFRAME_HEIGHT = 112;
  var PANEL_HEIGHT_DESKTOP = "min(560px, 80vh)";
  var WIDGET_WIDTH = "min(680px, calc(100vw - 32px))";
  var BAR_BOTTOM = "10px";
  var currentMode = "bar";
  var ready = false;

  function isMobile() {
    return window.matchMedia("(max-width: 480px)").matches;
  }

  function widgetSrc() {
    var params = new URLSearchParams({ agentId: agentId });
    return baseUrl + "/widget?" + params.toString();
  }

  function applyBarChrome(container, iframe) {
    currentMode = "bar";
    container.style.width = WIDGET_WIDTH;
    container.style.height = BAR_IFRAME_HEIGHT + "px";
    container.style.bottom = BAR_BOTTOM;
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.transition = ready ? "opacity 160ms ease" : "none";
    iframe.style.height = BAR_IFRAME_HEIGHT + "px";
    iframe.style.width = "100%";
  }

  function applyPanelChrome(container, iframe) {
    currentMode = "panel";
    var mobile = isMobile();
    container.style.height = mobile ? "90vh" : PANEL_HEIGHT_DESKTOP;
    container.style.width = mobile ? "100vw" : WIDGET_WIDTH;
    container.style.bottom = mobile ? "0" : BAR_BOTTOM;
    container.style.left = mobile ? "0" : "50%";
    container.style.transform = mobile ? "none" : "translateX(-50%)";
    container.style.transition = "height 200ms ease, width 200ms ease, opacity 160ms ease";
    iframe.style.height = "100%";
    iframe.style.width = "100%";
  }

  function reveal(container) {
    if (ready) return;
    ready = true;
    container.style.opacity = "1";
  }

  function createContainer() {
    var container = document.createElement("div");
    container.id = "calead-container";
    Object.assign(container.style, {
      position: "fixed",
      left: "50%",
      bottom: BAR_BOTTOM,
      transform: "translateX(-50%)",
      width: WIDGET_WIDTH,
      height: BAR_IFRAME_HEIGHT + "px",
      zIndex: "2147483000",
      background: "transparent",
      boxShadow: "none",
      pointerEvents: "none",
      overflow: "visible",
      opacity: "0",
      transition: "none",
    });

    var iframe = document.createElement("iframe");
    iframe.id = "calead-iframe";
    iframe.title = "Assistente de IA";
    iframe.src = widgetSrc();
    Object.assign(iframe.style, {
      width: "100%",
      height: BAR_IFRAME_HEIGHT + "px",
      border: "none",
      display: "block",
      background: "transparent",
      backgroundColor: "transparent",
      colorScheme: "dark",
      pointerEvents: "auto",
      overflow: "hidden",
    });
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("importance", "high");
    // Necessário pra gravação de voz (getUserMedia) funcionar dentro do
    // iframe cross-origin — sem isso o navegador bloqueia o microfone.
    iframe.setAttribute("allow", "microphone");

    container.appendChild(iframe);
    document.body.appendChild(container);
    return { container: container, iframe: iframe };
  }

  function init() {
    var parts = createContainer();
    var container = parts.container;
    var iframe = parts.iframe;

    // Failsafe: se ready não chegar, revela após load do iframe.
    iframe.addEventListener("load", function () {
      window.setTimeout(function () {
        reveal(container);
      }, 120);
    });

    window.addEventListener("message", function (event) {
      if (event.origin !== baseUrl) return;
      if (!event.data || typeof event.data !== "object") return;

      var type = event.data.type;

      if (type === "calead:ready") {
        applyBarChrome(container, iframe);
        reveal(container);
        return;
      }

      if (type === "calead:chrome") {
        if (event.data.mode === "panel") {
          applyPanelChrome(container, iframe);
        } else {
          applyBarChrome(container, iframe);
        }
        reveal(container);
        return;
      }

      // Legacy (compat): mode isolado
      if (type === "calead:mode") {
        if (event.data.mode === "panel") {
          applyPanelChrome(container, iframe);
        } else {
          applyBarChrome(container, iframe);
        }
        return;
      }

      // Legacy height: ignorado em modo bar (altura fixa). Em panel não se aplica.
      if (type === "calead:hide") {
        container.style.display = "none";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
