import 'tdesign-vue-next/es/style/index.css';
import '@tdesign-vue-next/chat/es/style/index.css';
import TDesignChat from '@tdesign-vue-next/chat';
import { Button, Input, Textarea, Select, Dialog, Loading } from 'tdesign-vue-next';
import type { App } from 'vue';

// 导出我们自己的组件
export { default as ChatComponent } from './Chat/Chat.vue'

// 导出 TDesign 组件和插件
export { TDesignChat }
export { Button as TButton }
export { Input as TInput }
export { Textarea as TTextarea }
export { Select as TSelect }
export { Dialog as TDialog }
export { Loading as TLoading }

// 创建一个包含所有必需组件的插件
const components = {
  Button,
  Input,
  Textarea,
  Select,
  Dialog,
  Loading,
}

// 导出一个 Vue 插件
export default {
  install: (app: App) => {
    // 注册所有 TDesign 基础组件
    Object.entries(components).forEach(([name, component]) => {
      app.component(`T${name}`, component)
    })
    // 注册 Chat 插件
    app.use(TDesignChat)
  }
}
