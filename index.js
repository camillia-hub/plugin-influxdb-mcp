// plugin-influxdb-mcp
// Queries InfluxDB time series.
// Grant requested: comment-task (the plugin only ever returns comment operations).

const MCP_SERVER_KEY = "influxdb";
const MCP_SERVER_CONFIG = {
  "command": "npx",
  "args": [
    "-y",
    "influxdb-mcp",
    "--url",
    "http://<host>:8086",
    "--org",
    "<org>",
    "--token",
    "<token>"
  ]
};
const SETUP_STEPS = [
  "Create a read token scoped to the metrics buckets.",
  "Store the token in the workspace secrets store.",
  "Add the entry to the workspace MCP configuration."
];
const DOCS_URL = "https://www.npmjs.com/package/influxdb-mcp";
const MAX_COMMENT_LENGTH = 10000;

function asString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

export function buildSetupComment(event) {
  const lines = [];
  lines.push("### InfluxDB MCP — workspace configuration");
  lines.push("");
  lines.push("This workspace has the **InfluxDB MCP** plugin installed.");
  lines.push("It installs and configures the InfluxDB MCP server: the agent can then run Flux queries, inspect buckets and measurements and chart metrics on InfluxDB.");
  const title = asString(event && event.taskTitle);
  if (title) {
    lines.push("");
    lines.push("Task: **" + title + "**");
  }
  lines.push("");
  lines.push("Add this entry to the workspace `mcp.servers` configuration:");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify({ [MCP_SERVER_KEY]: MCP_SERVER_CONFIG }, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("**Setup**");
  for (let i = 0; i < SETUP_STEPS.length; i++) {
    lines.push((i + 1) + ". " + SETUP_STEPS[i]);
  }
  lines.push("");
  lines.push("Docs: " + DOCS_URL);
  let text = lines.join("\n");
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH - 3) + "...";
  }
  return text;
}

export async function taskCreated(event) {
  const text = buildSetupComment(event);
  if (!text) return [];
  return [{ type: "comment", value: text }];
}

export const hooks = {
  "task.created": taskCreated,
};
