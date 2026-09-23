const trustpilot = "https://www.trustpilot.com";
const mcpOrigin = "https://mcp.getclera.com";
export const MCP_CONNECTOR_URL = mcpOrigin;
const adminMcpUrl = "https://mcp-clera.getclera.com/mcp";
const claudeAddAdminConnectorUrl = `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Clera%20Admin&connectorUrl=${encodeURIComponent(adminMcpUrl)}`;
const claudeAddConnectorUrl = `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Clera&connectorUrl=${encodeURIComponent(mcpOrigin)}`;

export const externalRoutes = {
	trustpilotReview: `${trustpilot}/review/getclera.com`,
	trustpilotEvaluate: `${trustpilot}/evaluate/getclera.com`,
	mcpServer: MCP_CONNECTOR_URL,
	claudeAddConnector: claudeAddConnectorUrl,
	adminMcpServer: adminMcpUrl,
	claudeAddAdminConnector: claudeAddAdminConnectorUrl,
	grokConnectors: "https://grok.com/connectors",
	mcpProtectedResource: `${mcpOrigin}/.well-known/oauth-protected-resource`,
	mcpAuthorizationServer: `${mcpOrigin}/.well-known/oauth-authorization-server`,
	slackChannel: (channelId: string) => `https://slack.com/archives/${channelId}`,
	askChatGpt: (prompt: string) => `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
	askClaude: (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
	askPerplexity: (prompt: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
	askGemini: (prompt: string) => `https://www.google.com/search?udm=50&q=${encodeURIComponent(prompt)}`,
	cursorInstallMcp: (serverName: string, serverUrl: string) =>
		`https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${encodeURIComponent(
			btoa(JSON.stringify({ url: serverUrl })),
		)}`,
};
