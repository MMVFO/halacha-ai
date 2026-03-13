import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { work, section, format = "text", includeMetadata = true } = body;

    if (!work) {
      return NextResponse.json({ error: "work is required" }, { status: 400 });
    }

    // Fetch the text content from the reader API
    const baseUrl = req.nextUrl.origin;
    const params = new URLSearchParams({ work });
    if (section) params.set("section", section);

    const readerRes = await fetch(`${baseUrl}/api/reader?${params}`);
    if (!readerRes.ok) {
      return NextResponse.json({ error: "Could not fetch text content" }, { status: 500 });
    }

    const readerData = await readerRes.json();
    const chunks = readerData.chunks || [];

    let output = "";

    if (format === "markdown") {
      output += `# ${work}\n`;
      if (section) output += `## ${section}\n`;
      output += "\n";

      if (includeMetadata && readerData.metadata) {
        const meta = readerData.metadata;
        if (meta.author) output += `**Author:** ${meta.author}\n`;
        if (meta.era) output += `**Era:** ${meta.era}\n`;
        output += "\n---\n\n";
      }

      for (const chunk of chunks) {
        if (chunk.section_ref) {
          output += `### ${chunk.section_ref}\n\n`;
        }
        output += `${chunk.text_content || chunk.text || ""}\n\n`;
      }
    } else if (format === "html") {
      output = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${work}${section ? ` - ${section}` : ""}</title>
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #333; }
  h1 { color: #8B7355; border-bottom: 2px solid #d4af37; padding-bottom: 8px; }
  h2 { color: #666; }
  .section-ref { font-size: 0.85em; color: #888; font-weight: bold; margin-top: 1.5em; }
  .chunk { margin-bottom: 1em; }
  .metadata { font-size: 0.9em; color: #666; margin-bottom: 2em; padding: 12px; background: #f9f6f0; border-radius: 8px; }
  [dir="rtl"] { font-family: 'Noto Serif Hebrew', serif; }
</style>
</head>
<body>
<h1>${work}</h1>
${section ? `<h2>${section}</h2>` : ""}
`;

      if (includeMetadata && readerData.metadata) {
        const meta = readerData.metadata;
        output += `<div class="metadata">`;
        if (meta.author) output += `<div><strong>Author:</strong> ${meta.author}</div>`;
        if (meta.era) output += `<div><strong>Era:</strong> ${meta.era}</div>`;
        output += `</div>\n`;
      }

      for (const chunk of chunks) {
        const lang = chunk.language || "en";
        const dir = lang === "he" || lang === "arc" ? 'dir="rtl"' : "";
        if (chunk.section_ref) {
          output += `<div class="section-ref">${chunk.section_ref}</div>\n`;
        }
        output += `<div class="chunk" ${dir}>${chunk.text_content || chunk.text || ""}</div>\n`;
      }

      output += `</body></html>`;
    } else {
      // Plain text
      output += `${work}\n`;
      if (section) output += `${section}\n`;
      output += "=".repeat(40) + "\n\n";

      for (const chunk of chunks) {
        if (chunk.section_ref) {
          output += `[${chunk.section_ref}]\n`;
        }
        output += `${chunk.text_content || chunk.text || ""}\n\n`;
      }
    }

    const contentType =
      format === "html"
        ? "text/html"
        : format === "markdown"
          ? "text/markdown"
          : "text/plain";

    return new NextResponse(output, {
      headers: {
        "Content-Type": `${contentType}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${work.replace(/[^a-zA-Z0-9]/g, "_")}${section ? `_${section.replace(/[^a-zA-Z0-9]/g, "_")}` : ""}.${format === "html" ? "html" : format === "markdown" ? "md" : "txt"}"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
