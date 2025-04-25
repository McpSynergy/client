import React from "react";

export const listMcpr = [
  {
    name: "userProfile",
    serverName: "mcp-component-render",
    description: "Show user profile",
    component: React.lazy(() => import("./src/components/UserProfile")),
    inputSchema: {
      type: "object",
      properties: {
        userName: {
          type: "string",
          description: "User name",
        },
      },
    },
  },
];
