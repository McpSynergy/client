/// <reference types="vite/client" />

// 为 .vue 文件添加类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
} 