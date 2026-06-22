function formatGenerateError(data, isRetry) {
  if (data.error || data.error_description) {
    var err = data.error || data.error_description;
    return typeof err === "object" ? JSON.stringify(err) : err;
  }
  if (isRetry) {
    return JSON.stringify(data);
  }
  return "API error: " + JSON.stringify(data);
}

async function fetchGenerate(body) {
  var res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callGenerateWithRetry(body) {
  var data = await fetchGenerate(body);
  if (data.content) return data;

  var errMsg = formatGenerateError(data, false);
  if (errMsg.indexOf("overloaded") === -1) {
    throw new Error(errMsg);
  }

  await new Promise(function (r) {
    setTimeout(r, 2000);
  });

  var data2 = await fetchGenerate(body);
  if (!data2.content) {
    throw new Error(formatGenerateError(data2, true));
  }
  return data2;
}

function contentToText(data) {
  return data.content
    .map(function (b) {
      return b.text || "";
    })
    .join("");
}

function parseGenerateJson(data) {
  var raw = contentToText(data);
  var m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON in response");
  return JSON.parse(m[0]);
}

export { callGenerateWithRetry, parseGenerateJson, contentToText };
