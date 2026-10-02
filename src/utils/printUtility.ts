/**
 * High-Reliability Printing Engine for DDL-PN Official Documents
 * Supports:
 * - Native window.print() with pre-focus
 * - Fallback isolated iframe print (bypasses modal clipping & container overflow bugs)
 * - Standalone popup window printing for full-page PDF export
 */

export function executeReliablePrint(elementId: string = 'ddlpn-printable-sheet'): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        // Fallback to standard window.print if element not found
        window.focus();
        window.print();
        resolve(true);
        return;
      }

      // 1. Try iframe-based print first to guarantee that only the document prints
      // without modal dialog chrome, scrollbars, or background UI interference.
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.zIndex = '-9999';
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (!iframeDoc || !printIframe.contentWindow) {
        // Fallback to native window.print
        window.focus();
        window.print();
        cleanupIframe(printIframe);
        resolve(true);
        return;
      }

      // Collect all head stylesheets and inline styles
      let headStyles = '';
      const styleNodes = document.querySelectorAll('link[rel="stylesheet"], style');
      styleNodes.forEach(node => {
        headStyles += node.outerHTML;
      });

      // Assemble pristine isolated HTML page
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8" />
            <title>Impression Officielle - DDL-PN</title>
            ${headStyles}
            <style>
              @page {
                size: A4 portrait;
                margin: 6mm 8mm 6mm 8mm;
              }
              body {
                background: white !important;
                color: #000 !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: 'Merriweather', Georgia, serif;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-page-a4 {
                width: 100% !important;
                max-width: 210mm !important;
                max-height: 284mm !important;
                overflow: hidden !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                box-sizing: border-box !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
              }
              .print-ticket-58mm {
                width: 58mm !important;
                max-width: 58mm !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border: none !important;
                padding: 2mm !important;
              }
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for resources/styles to settle before triggering print
      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setTimeout(() => {
            cleanupIframe(printIframe);
            resolve(true);
          }, 1500);
        } catch (e) {
          // If iframe print fails due to browser restrictions, trigger native print
          window.focus();
          window.print();
          cleanupIframe(printIframe);
          resolve(true);
        }
      }, 350);

    } catch (err) {
      window.focus();
      window.print();
      resolve(true);
    }
  });
}

function cleanupIframe(iframe: HTMLIFrameElement) {
  try {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Opens document in a dedicated clean tab for native browser printing & Save as PDF
 */
export function openDocumentInNewTab(elementId: string = 'ddlpn-printable-sheet', title: string = 'Document Officiel DDL-PN'): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    alert('Veuillez autoriser les fenêtres pop-up pour ouvrir la page d\'impression.');
    return;
  }

  let headStyles = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
    headStyles += node.outerHTML;
  });

  newWindow.document.open();
  newWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 10mm 10mm;
          }
          body {
            background: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            font-family: 'Merriweather', Georgia, serif;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .action-bar {
            background: #022448;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 210mm;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .btn-print {
            background: #006d2f;
            color: white;
            border: none;
            padding: 8px 18px;
            font-weight: bold;
            font-size: 13px;
            border-radius: 8px;
            cursor: pointer;
          }
          .sheet-container {
            background: white;
            width: 210mm;
            min-height: 297mm;
            box-shadow: 0 4px 25px rgba(0,0,0,0.15);
            padding: 20mm;
            box-sizing: border-box;
          }
          @media print {
            body {
              background: white !important;
              padding: 0 !important;
            }
            .action-bar {
              display: none !important;
            }
            .sheet-container {
              box-shadow: none !important;
              padding: 0 !important;
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="action-bar">
          <div>
            <strong>${title}</strong> — Direction Départementale des Loisirs de Pointe-Noire
          </div>
          <button class="btn-print" onclick="window.print()">Imprimer / Sauvegarder en PDF</button>
        </div>
        <div class="sheet-container">
          ${element.innerHTML}
        </div>
        <script>
          // Automatically trigger print on load
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  newWindow.document.close();
}
