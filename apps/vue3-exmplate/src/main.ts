import './assets/main.css'
import 'tdesign-vue-next/es/style/index.css';
import '@tdesign-vue-next/chat/es/style/index.css'; // 引入chat组件的少量全局样式变量
import TDesignChat from '@tdesign-vue-next/chat';
import cloudWindow from 'ugos-core/cloudWindow';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next';

import App from './App.vue'
import router from './router'
import { register } from './ugoscore';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(TDesign)
app.use(TDesignChat)

register({ app, router }).finally(() => {
  app.use(router).mount('#app');
  // @ts-ignore
  window.cloudWindow = cloudWindow
});
