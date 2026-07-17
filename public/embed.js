(function () {
  "use strict";

  // Descobre a URL base a partir do próprio <script src="...">, para
  // funcionar embutido em qualquer site, apontando de volta pro servidor
  // do widget.
  var currentScript = document.currentScript;
  var scriptUrl = new URL(currentScript.src);
  var baseUrl = scriptUrl.origin;

  var agentId = currentScript.getAttribute("data-agent-id") || "demo";
  var companyName = currentScript.getAttribute("data-company-name") || "Calead";
  var primaryColor = currentScript.getAttribute("data-primary-color") || "";

  var isOpen = false;
  var iframe = null;

  function widgetSrc() {
    var params = new URLSearchParams({
      agentId: agentId,
      companyName: companyName,
    });
    if (primaryColor) params.set("primaryColor", primaryColor);
    return baseUrl + "/widget?" + params.toString();
  }

  function createBubble() {
    var bubble = document.createElement("button");
    bubble.setAttribute("aria-label", "Abrir chat com " + companyName);
    bubble.id = "calead-bubble";
    bubble.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M4 4h16v12H7l-3 3V4z" stroke="white" stroke-width="1.6" stroke-linejoin="round"/>' +
      "</svg>";
    Object.assign(bubble.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      border: "none",
      background: "#4F46E5",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.25)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "2147483000",
    });
    bubble.addEventListener("click", toggleWidget);
    document.body.appendChild(bubble);
    return bubble;
  }

  function createIframe() {
    var frame = document.createElement("iframe");
    frame.id = "calead-iframe";
    frame.title = "Assistente de IA " + companyName;
    frame.src = widgetSrc();
    var mobile = window.matchMedia("(max-width: 480px)").matches;
    Object.assign(frame.style, {
      position: "fixed",
      bottom: mobile ? "0" : "90px",
      right: mobile ? "0" : "20px",
      width: mobile ? "100%" : "380px",
      height: mobile ? "100%" : "600px",
      maxHeight: "calc(100vh - 40px)",
      border: "none",
      borderRadius: mobile ? "0" : "16px",
      boxShadow: "0 16px 48px rgba(15, 23, 42, 0.28)",
      zIndex: "2147483000",
      display: "none",
      colorScheme: "light",
    });
    document.body.appendChild(frame);
    return frame;
  }

  function toggleWidget() {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? "block" : "none";
  }

  function closeWidget() {
    isOpen = false;
    iframe.style.display = "none";
  }

  window.addEventListener("message", function (event) {
    if (!event.data || typeof event.data !== "object") return;
    if (event.data.type === "calead:close") closeWidget();
  });

  function init() {
    createBubble();
    iframe = createIframe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
