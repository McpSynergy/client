import { DynamicRender } from "@mcp-synergy/react";
function App() {
  return (
    <div>
      {/* 插件在做解析的时候，这里的路径需要处理成项目的绝对路径？ */}
      <DynamicRender path={`${process.env.ROOT_DIR}/src/DyApp.tsx`} />
    </div>
  );
}

export default App;
