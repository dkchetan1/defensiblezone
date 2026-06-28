// ── CORS headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function getFileType(fileName) {
  if (typeof fileName !== "string") return null;
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  return null;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid request body" });
    }
  }

  const { fileName, fileData } = body || {};

  if (!fileData || typeof fileData !== "string" || !fileData.trim()) {
    return res.status(400).json({ success: false, error: "No file provided." });
  }

  const fileType = getFileType(fileName);
  if (!fileType) {
    return res.status(400).json({
      success: false,
      error: "Only PDF and DOCX files are supported.",
    });
  }

  let buffer;
  try {
    buffer = Buffer.from(fileData, "base64");
  } catch {
    return res.status(400).json({ success: false, error: "Invalid file data." });
  }

  if (buffer.length === 0) {
    return res.status(400).json({ success: false, error: "No file provided." });
  }

  if (buffer.length > MAX_FILE_BYTES) {
    return res.status(400).json({
      success: false,
      error: "File is too large. Please upload a file under 5MB.",
    });
  }

  if (fileType === "pdf") {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      const text = typeof data.text === "string" ? data.text : "";
      if (!text.trim()) {
        return res.status(200).json({ success: true, text: "", extractable: false });
      }
      return res.status(200).json({ success: true, text });
    } catch {
      console.error("parse-resume: PDF parsing failed");
      return res.status(400).json({
        success: false,
        error: "Unable to read this PDF file.",
      });
    }
  }

  if (fileType === "docx") {
    try {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      const text = typeof result.value === "string" ? result.value : "";
      if (!text.trim()) {
        return res.status(200).json({ success: true, text: "", extractable: false });
      }
      return res.status(200).json({ success: true, text });
    } catch {
      console.error("parse-resume: DOCX parsing failed");
      return res.status(400).json({
        success: false,
        error: "Unable to read this Word document.",
      });
    }
  }

  return res.status(500).json({ success: false, error: "Something went wrong." });
}
