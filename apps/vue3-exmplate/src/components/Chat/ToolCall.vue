<template>
  <div class="tool-call">
    <div class="tool-call-header" @click="toggleExpand">
      <div class="tool-call-name">
        <span class="tool-call-title">调用工具: {{ props.name }}</span>
        <span class="tool-call-action">{{ props.action }}</span>
      </div>
      <div class="tool-call-actions">
        <div class="tool-call-service">{{ props.serverName }}</div>
        <t-icon name="chevron-down" :class="{ expanded: isExpanded }" />
      </div>
    </div>
    <div class="tool-call-content" :class="{ expanded: isExpanded }">
      <div class="tool-call-props">
        <div v-if="props.arguments" class="tool-call-prop">
          <span class="tool-call-prop-name">参数:</span>
          <span class="tool-call-prop-value">{{ props.arguments }}</span>
        </div>
      </div>
      <br />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  name: string
  serverName: string
  arguments: Record<string, unknown>
  action: string
  toolProps: Record<string, unknown>
}

const props = defineProps<Props>()
const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.tool-call {
  margin: 8px 0;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
  background-color: #ffffff;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
}

.tool-call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: #f5f6f7;
  border-bottom: 1px solid #e5e6eb;
  cursor: pointer;
  user-select: none;
}

.tool-call-header:hover {
  background-color: #ebedf0;
}

.tool-call-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.tool-call-icon {
  font-size: 14px;
}

.tool-call-title {
  font-size: 13px;
  color: #1a1a1a;
}

.tool-call-action {
  font-size: 12px;
  color: #86909c;
  background-color: #ebedf0;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.tool-call-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #000;
  }
}

.tool-call-service {
  font-size: 12px;
  color: #86909c;
}

.expand-icon {
  font-size: 14px;
  color: #000;
  transition: transform 0.1s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.tool-call-content {
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s ease-out,
    padding 0.3s ease-out;
  padding: 0 12px;
}

.tool-call-content.expanded {
  max-height: 500px;
  padding: 12px;
}

.tool-call-props {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-call-prop {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.tool-call-prop-name {
  color: #86909c;
  white-space: nowrap;
}

.tool-call-prop-value {
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  color: #1a1a1a;
}
</style>
