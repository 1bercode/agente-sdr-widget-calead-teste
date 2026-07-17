(function () {
  "use strict";

  // Descobre a URL base a partir do próprio <script src="...">, pra
  // funcionar embutido em qualquer site, apontando de volta pro servidor
  // do widget.
  var currentScript = document.currentScript;
  var scriptUrl = new URL(currentScript.src);
  var baseUrl = scriptUrl.origin;

  var agentId = currentScript.getAttribute("data-agent-id");
  if (!agentId) {
    console.error("[calead] embed.js precisa de data-agent-id no <script>.");
    return;
  }

  var BAR_HEIGHT = "56px";
  var PANEL_HEIGHT_DESKTOP = "min(600px, 80vh)";

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
      left: "0",
      right: "0",
      bottom: "0",
      width: "100%",
      height: BAR_HEIGHT,
      zIndex: "2147483000",
      boxShadow: "0 -2px 12px rgba(15, 23, 42, 0.06)",
      transition: "height 160ms ease",
      background: "#ffffff",
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
      colorScheme: "light",
    });

    container.appendChild(iframe);
    document.body.appendChild(container);
    return container;
  }

  function setMode(container, mode) {
    var expanded = mode === "panel";
    var mobile = isMobile();
    container.style.height = expanded ? (mobile ? "100%" : PANEL_HEIGHT_DESKTOP) : BAR_HEIGHT;
    container.style.boxShadow = expanded
      ? "0 -16px 48px rgba(15, 23, 42, 0.22)"
      : "0 -2px 12px rgba(15, 23, 42, 0.06)";
  }

  function init() {
    var container = createContainer();

    window.addEventListener("message", function (event) {
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
