function parseYaml(text) {
  const config = {};
  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex < 0) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    config[key] = value.replace(/^["']|["']$/g, "");
  });
  return config;
}

async function loadText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load config file: ${path}`);
  }
  return response.text();
}

async function loadJson(path) {
  const text = await loadText(path);
  return JSON.parse(text);
}

export async function loadConfig(options = {}) {
  const jsonPath = options.jsonPath || "/config.json";
  const yamlPath = options.yamlPath || "/config.yaml";
  const prefer = options.prefer || "json";

  const orderedSources = prefer === "yaml"
    ? [{ type: "yaml", path: yamlPath }, { type: "json", path: jsonPath }]
    : [{ type: "json", path: jsonPath }, { type: "yaml", path: yamlPath }];

  for (const source of orderedSources) {
    try {
      if (source.type === "json") {
        return await loadJson(source.path);
      }
      const content = await loadText(source.path);
      return parseYaml(content);
    } catch (_error) {
      // Try next source.
    }
  }

  return {};
}
