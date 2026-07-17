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

  var PANEL_HEIGHT_DESKTOP = "min(560px, 80vh)";
  var WIDGET_WIDTH = "min(680px, calc(100vw - 32px))";
  var BAR_BOTTOM = "10px";
  var currentMode = "bar";

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
      bottom: BAR_BOTTOM,
      transform: "translateX(-50%)",
      width: WIDGET_WIDTH,
      height: "auto",
      minHeight: "0",
      zIndex: "2147483000",
      background: "transparent",
      boxShadow: "none",
      transition: "height 200ms ease, width 200ms ease",
      pointerEvents: "none",
      overflow: "visible",
    });

    var iframe = document.createElement("iframe");
    iframe.id = "calead-iframe";
    iframe.title = "Assistente de IA";
    iframe.src = widgetSrc();
    Object.assign(iframe.style, {
      width: "100%",
      height: "64px",
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

    container.appendChild(iframe);
    document.body.appendChild(container);
    return { container: container, iframe: iframe };
  }

  function setMode(container, iframe, mode) {
    currentMode = mode;
    var expanded = mode === "panel";
    var mobile = isMobile();

    if (expanded) {
      container.style.height = mobile ? "90vh" : PANEL_HEIGHT_DESKTOP;
      iframe.style.height = "100%";
      container.style.width = mobile ? "100vw" : WIDGET_WIDTH;
      container.style.bottom = mobile ? "0" : BAR_BOTTOM;
      container.style.left = mobile ? "0" : "50%";
      container.style.transform = mobile ? "none" : "translateX(-50%)";
      return;
    }

    container.style.width = WIDGET_WIDTH;
    container.style.bottom = BAR_BOTTOM;
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.height = "auto";
  }

  function setBarHeight(container, iframe, height) {
    if (currentMode !== "bar") return;
    var px = Math.max(52, Math.min(Math.ceil(height), 160));
    iframe.style.height = px + "px";
    container.style.height = px + "px";
  }

  function init() {
    var parts = createContainer();
    var container = parts.container;
    var iframe = parts.iframe;

    window.addEventListener("message", function (event) {
      if (event.origin !== baseUrl) return;
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "calead:mode") {
        setMode(container, iframe, event.data.mode);
      } else if (event.data.type === "calead:height") {
        setBarHeight(container, iframe, Number(event.data.height) || 0);
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
