'use client';

import { useState } from 'react';
import { mcpClient } from '@/lib/mcp-client';

export default function MCPDemo() {
  const [tools, setTools] = useState<Array<{name: string; description: string}>>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const connectToMCP = async () => {
    setLoading(true);
    try {
      await mcpClient.connect();
      setConnected(true);
      const availableTools = await mcpClient.listTools();
      setTools(availableTools || []);
    } catch (error) {
      console.error('Failed to connect to MCP:', error);
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const callTool = async (toolName: string) => {
    try {
      const response = await mcpClient.callTool(toolName, {});
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error calling tool: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MCP Client Demo</h1>
      
      <div className="mb-6">
        <button
          onClick={connectToMCP}
          disabled={loading || connected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : connected ? 'Connected' : 'Connect to MCP'}
        </button>
        
        <div className="mt-2">
          Status: <span className={connected ? 'text-green-600' : 'text-red-600'}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {tools.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Available Tools</h2>
          <div className="space-y-2">
            {tools.map((tool, index) => (
              <div key={index} className="p-3 border rounded">
                <div className="font-medium">{tool.name}</div>
                <div className="text-sm text-gray-600">{tool.description}</div>
                <button
                  onClick={() => callTool(tool.name)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Call Tool
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}