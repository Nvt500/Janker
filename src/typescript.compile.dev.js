(function () {
  // Polyfill for older browsers
  if (!window.console) {
    window.console = { log: function () {} };
  }

  function hashCode(s) {
    let hsh = 0;
    for (let i = 0; i < s.length; i++) {
      const chr = s.charCodeAt(i);
      hsh = (hsh << 5) - hsh + chr;
      hsh |= 0; // Convert to 32bit integer
    }
    return hsh;
  }

  function load(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.overrideMimeType?.("text/plain");
    xhr.send(null);
    return xhr.status === 200 ? xhr.responseText : false;
  }

  function compile() {
    const tsScripts = document.querySelectorAll('script[type="text/typescript"]');
    tsScripts.forEach((tsScript) => {
      const sourceCode = tsScript.src ? load(tsScript.src) : tsScript.textContent;
      if (!sourceCode) return;

      const result = ts.transpileModule(sourceCode, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.None,
          jsx: ts.JsxEmit.React,
          strict: true
        },
        fileName: tsScript.src || "inline.ts",
        reportDiagnostics: true
      });

      if (result.diagnostics?.length) {
        result.diagnostics.forEach((diag) => {
          const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");
          console.log("TypeScript error:", message);
        });
      }

      const jsScript = document.createElement("script");
      jsScript.textContent = result.outputText;
      tsScript.parentNode.insertBefore(jsScript, tsScript);

      // FOR ONE FILE JS STUFF
      document.getElementById("js").content += `// File: ${tsScript.src.slice(tsScript.src.indexOf("typescript/") + 11)}\n\n${jsScript.textContent}\n\n\n`;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", compile);
  } else {
    compile();
  }
})();