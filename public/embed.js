(function () {
  "use strict";

  var currentScript = document.currentScript;
  var scriptUrl = new URL(currentScript.src);
  var baseUrl = scriptUrl.origin;

  var agentId = currentScript.getAttribute("data-agent-id");
  if (!agentId) {
    console.error("[calead] embed.js precisa de data-agent-id no <script>.");
    return;
  }

  var COLLAPSED_HEIGHT = "148px";
  var PANEL_HEIGHT_DESKTOP = "min(560px, 80vh)";
  var WIDGET_WIDTH = "min(680px, calc(100vw - 32px))";

  function isMobile() {
    return window.matchMedia("(max-width: 480px)").matches;
  }

  function widgetSrc() {
    var params = new URLSearchParams({ agentId: agentId });
    return baseUrl + "/widget?" + params.toString();
  }

  function createContainer() {
    var container = document.createElement("div");
    container.id = "calead-container";
    Object.assign(container.style, {
      position: "fixed",
      left: "50%",
      bottom: "20px",
      transform: "translateX(-50%)",
      width: WIDGET_WIDTH,
      height: COLLAPSED_HEIGHT,
      zIndex: "2147483000",
      background: "transparent",
      boxShadow: "none",
      transition: "height 200ms ease, width 200ms ease",
      pointerEvents: "none",
    });

    var iframe = document.createElement("iframe");
    iframe.id = "calead-iframe";
    iframe.title = "Assistente de IA";
    iframe.src = widgetSrc();
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
      background: "transparent",
      colorScheme: "dark",
      pointerEvents: "auto",
    });
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");

    container.appendChild(iframe);
    document.body.appendChild(container);
    return container;
  }

  function setMode(container, mode) {
    var expanded = mode === "panel";
    var mobile = isMobile();
    container.style.height = expanded ? (mobile ? "90vh" : PANEL_HEIGHT_DESKTOP) : COLLAPSED_HEIGHT;
    container.style.width = expanded && mobile ? "100vw" : WIDGET_WIDTH;
    container.style.bottom = expanded && mobile ? "0" : "20px";
    container.style.left = expanded && mobile ? "0" : "50%";
    container.style.transform = expanded && mobile ? "none" : "translateX(-50%)";
  }

  function init() {
    var container = createContainer();

    window.addEventListener("message", function (event) {
      if (event.origin !== baseUrl) return;
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "calead:mode") {
        setMode(container, event.data.mode);
      } else if (event.data.type === "calead:hide") {
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
