/**
 * Strips attributes that browser extensions stamp onto the DOM before React
 * hydrates.
 *
 * Bitdefender's browser extension walks the parsed HTML and marks every element
 * it has inspected with bis_skin_checked="1". Grammarly does the same with its
 * data-gr-* pair. Both run after the HTML is parsed but before the Next.js
 * bundle hydrates, so React sees attributes the server never rendered and
 * reports a hydration mismatch on every page load. suppressHydrationWarning on
 * <html>/<body> does not help: it only covers that one element, and the
 * extension stamps arbitrary nested divs.
 *
 * The observer removes the attributes as they appear and disconnects once the
 * page has loaded and hydration is finished — after that the extension is free
 * to mark whatever it likes.
 */
const GUARD_SCRIPT = `
(function () {
  if (typeof MutationObserver !== "function") return;

  var ATTRS = [
    "bis_skin_checked",
    "bis_size",
    "bis_id",
    "data-gr-ext-installed",
    "data-new-gr-c-s-check-loaded",
    "data-new-gr-c-s-loaded"
  ];

  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var target = records[i].target;
      if (target && target.nodeType === 1) {
        target.removeAttribute(records[i].attributeName);
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ATTRS,
    subtree: true
  });

  window.addEventListener("load", function () {
    setTimeout(function () {
      observer.disconnect();
    }, 0);
  });
})();
`;

export function ExtensionAttributeGuard() {
  return (
    <script
      id="extension-attribute-guard"
      // Must run during HTML parsing, ahead of the deferred hydration bundle.
      dangerouslySetInnerHTML={{ __html: GUARD_SCRIPT }}
    />
  );
}
