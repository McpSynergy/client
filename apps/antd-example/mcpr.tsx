import React from "react";

export const listMcpr = [
  {
    name: "userProfile",
    serverName: "mcp-component-render",
    description: "Show user profile",
    component: React.lazy(() => import("./src/components/UserProfile")),
  },
  {
    name: "book-card",
    serverName: "mcp-component-render",
    description: "Show book card",
    component: React.lazy(() => import("./src/components/Books/BookCard")),
  },
];
