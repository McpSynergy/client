import { DynamicRender } from "@mcp-synergy/react";
function App() {
  return (
    <div>
      <DynamicRender path={`${process.env.ROOT_DIR}/src/DyApp.tsx`} />
    </div>
  );
}

export default App;
