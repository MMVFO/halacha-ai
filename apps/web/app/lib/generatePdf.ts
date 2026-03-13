export function generatePdf(
  title: string,
  content: string,
  options?: { includeCommentary: boolean }
): void {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = "0";
  iframe.style.height = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  const commentaryNote = options?.includeCommentary
    ? `<p style="color:#666;font-style:italic;margin-top:24px;font-size:12px;">Commentary included</p>`
    : "";

  doc.open();
  doc.write(`<!DOCTYPE html>
<html dir="auto">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Noto+Serif+Hebrew:wght@400;500;600&display=swap');

    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: #1a1a1a;
      background: #fff;
      max-width: 700px;
      margin: 0 auto;
      padding: 40px 30px;
      line-height: 1.7;
      font-size: 14px;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #0a0e1a;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 8px;
    }
    .subtitle {
      font-size: 12px;
      color: #666;
      margin-bottom: 24px;
    }
    .content {
      white-space: pre-wrap;
      font-size: 15px;
    }
    .content [dir="rtl"], .content .hebrew {
      font-family: 'Noto Serif Hebrew', serif;
      direction: rtl;
      text-align: right;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="subtitle">Exported from Halacha AI &bull; ${new Date().toLocaleDateString()}</div>
  <div class="content">${formatContent(content)}</div>
  ${commentaryNote}
</body>
</html>`);
  doc.close();

  // Wait for fonts to load, then print
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatContent(content: string): string {
  // Detect Hebrew text and wrap in appropriate tags
  const lines = content.split("\n");
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "<br/>";
      // Check if line contains Hebrew characters
      const hasHebrew = /[\u0590-\u05FF]/.test(trimmed);
      if (hasHebrew) {
        return `<p dir="rtl" style="font-family:'Noto Serif Hebrew',serif;text-align:right;">${escapeHtml(trimmed)}</p>`;
      }
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .join("\n");
}
