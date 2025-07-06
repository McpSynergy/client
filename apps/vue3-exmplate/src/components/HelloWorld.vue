<script setup lang="ts">
import { defineMCPComponent } from '@/utils/mcp'
import type { Ref } from 'vue'

interface Props {
  msg: string
  title?: Ref<string>
  description?: string
}

const props = defineProps<Props>()

// 使用 defineMCPComponent 函数定义 MCP 配置
defineMCPComponent({
  name: 'MyVueComponent',
  description: '这是一个示例 Vue 组件xxxx',
  version: '1.0.0',
  pickProps: ['msg'],
  inputSchema: {
    required: ['name'],
    properties: {
      name: {
        description: '用户名称',
      },
    },
  },
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3 v-if="title">{{ title }}</h3>
    <h3>
      You've successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>. What's next?
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
