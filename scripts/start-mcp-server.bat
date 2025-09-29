@echo off
echo Starting PromptX MCP Server...
echo.
echo This will start the MCP server on http://127.0.0.1:5204

npx @promptx/mcp-server --transport http --port 5204 --cors

pause
