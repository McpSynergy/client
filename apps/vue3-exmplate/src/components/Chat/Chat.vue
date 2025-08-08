<template>
  <!-- 悬浮在右下角的智能助手按钮 -->
  <t-chat
    layout="single"
    style="height: 100%; width: 100%"
    :style="{ height: isMaximized ? '90vh' : '600px' }"
    :data="chatList"
    :clear-history="chatList.length > 0 && !isStreamLoad"
    :text-loading="loading"
    :is-stream-load="isStreamLoad"
    @on-action="operation"
    @clear="clearConfirm"
  >
    <template #content="{ item }">
      <div>
        <div v-if="item.toolCalls && item.toolCalls.length">
          <ToolCall
            v-for="toolCall in item.toolCalls"
            :key="toolCall.toolCallId"
            :name="toolCall.name"
            :server-name="toolCall.serverName"
            :arguments="toolCall.arguments"
            :action="toolCall.action"
            :tool-props="toolCall.props || {}"
          />
        </div>
        <t-chat-content :content="item.content" />
        <div v-if="item.components && item.components.length">
          <div style="display: flex; flex-direction: column; gap: 10px">
            <template v-for="component in item.components" :key="component.toolName">
              <ChatComponent
                :name="component.toolName"
                :server-name="component.serverName"
                :props="component.props"
              />
              <!-- <MediaCard
                v-if="component.toolName === 'MediaCard'"
                :name="component.toolName"
                :server-name="component.serverName"
                :movie="component.props.movie"
              />
              <MusicCard
                v-if="component.toolName === 'MusicCard'"
                :name="component.toolName"
                :server-name="component.serverName"
                :music-data="component.props.musicData"
              /> -->
            </template>
          </div>
        </div>
      </div>
    </template>

    <template #actions="{ item }">
      <t-chat-action
        :content="item.content"
        :operation-btn="['good', 'bad', 'replay', 'copy']"
        @operation="handleOperation"
      />
    </template>
    <template #footer>
      <t-chat-input :stop-disabled="isStreamLoad" @send="inputEnter" @stop="onStop"> </t-chat-input>
    </template>
  </t-chat>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, defineComponent } from 'vue'
// import { ChatComponent } from '@mcp-synergy/vue'
// import MediaCard from '../MediaCard.vue'
// import MusicCard from '../MusicCard.vue'
import ToolCall from './ToolCall.vue'

defineComponent({
  name: 'AiChatWindow',
})

import cloudWindow from 'ugos-core/cloudWindow'

import { HttpAgent, type RunAgentInput } from '@ag-ui/client'
import { ChatComponent } from '@mcp-synergy/vue'

interface ComponentData {
  toolName: string
  serverName: string
  props: Record<string, unknown>
}

interface ToolCallData {
  name: string
  serverName: string
  arguments: Record<string, unknown> | string
  action: 'start' | 'end'
  props?: Record<string, unknown>
  toolCallId: string
}

interface ChatMessage {
  id?: string
  avatar?: string
  name?: string
  datetime?: string
  content: string
  role: 'user' | 'assistant' | 'model-change' | 'error'
  components?: ComponentData[]
  toolCalls?: ToolCallData[]
}

type ExtendedChatMessage = ChatMessage

const agent = new HttpAgent({
  url: '',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': 'f3de0210ee9003d84626476c631ffc0d1ddf0c268696d7d3e2caa5a3b71273b6',
  },
})

const setBackgroundColor = (backgroundColor: string) => {
  const dom = document.querySelector('.t-chat__list') as HTMLElement | null
  if (dom) dom.style.backgroundColor = backgroundColor
}

// 注册 subscriber
agent.subscribe({
  onTextMessageStartEvent: () => {
    isStreamLoad.value = true
    loading.value = true
  },

  onTextMessageContentEvent: ({ event }: { event: { delta: string } }) => {
    if (chatList.value[0]) {
      const message = chatList.value[0]

      // 累加 delta 到现有内容
      message.content = (message.content || '') + event.delta
      console.log(message.content)
    }
  },

  onTextMessageEndEvent: () => {
    isStreamLoad.value = false
    loading.value = false
  },

  onToolCallStartEvent: ({ event }: { event: { toolCallName: string; toolCallId: string } }) => {
    if (chatList.value[0]) {
      const message = chatList.value[0]
      if (!message.toolCalls) {
        message.toolCalls = []
      }
      message.toolCalls.push({
        name: event.toolCallName,
        serverName: 'AI Assistant',
        arguments: {},
        action: 'start',
        toolCallId: event.toolCallId,
      })
    }
    console.log('Tool call started:', event.toolCallName)
  },

  onToolCallEndEvent: ({
    event,
    toolCallName,
    toolCallArgs,
  }: {
    event: { toolCallId: string }
    toolCallName: string
    toolCallArgs: Record<string, unknown>
  }) => {
    if (chatList.value[0]) {
      const message = chatList.value[0]
      if (message.toolCalls) {
        const toolCall = message.toolCalls.find((tc) => tc.toolCallId === event.toolCallId)
        if (toolCall) {
          toolCall.action = 'end'
          toolCall.arguments = toolCallArgs
        }
      }
    }
    console.log('Tool call ended:', toolCallName, toolCallArgs)
  },

  onToolCallResultEvent: ({
    event,
  }: {
    event: { content: string; toolCallId: string; messageId: string }
  }) => {
    try {
      console.log('event', event)

      const resultData = JSON.parse(event.content) as {
        _meta?: { props?: Record<string, unknown> }
      }
      if (chatList.value[0]) {
        const message = chatList.value[0]

        // 添加 AI 的文本回复
        // if (resultData._meta.aiOutput?.text) {
        //   message.content = resultData._meta.aiOutput.text
        // }

        // 如果有组件数据，添加组件
        if (resultData?._meta?.props) {
          if (!message.components) {
            message.components = []
          }

          const propsData = resultData._meta.props as Record<string, unknown>
          const inferredToolName = propsData && 'musicData' in propsData ? 'MusicCard' : 'MediaCard'

          const component: ComponentData = {
            toolName: inferredToolName,
            serverName: 'mcp-component-render',
            props: propsData,
          }

          message.components.push(component)

          // 处理媒体卡片和音乐卡片
          handleMediaAndMusicCards(component)
        } else {
          // 根据 toolCallId 获取 toolCall
          const toolCall = message.toolCalls?.find((tc) => tc.toolCallId === event.toolCallId)
          console.log('toolCall', toolCall)

          if (toolCall?.name === 'setTheme') {
            const argsRaw = toolCall.arguments
            const argsObj =
              typeof argsRaw === 'string'
                ? (JSON.parse(argsRaw) as Record<string, unknown>)
                : argsRaw || {}
            const backgroundColor = argsObj?.backgroundColor
            if (typeof backgroundColor === 'string') setBackgroundColor(backgroundColor)
          }
        }
        console.log('message', message)
      }
    } catch (e) {
      console.error('Failed to parse tool call result:', e)
    }
  },

  onRunErrorEvent: ({ event }: { event: { message: string } }) => {
    if (chatList.value[0]) {
      const message = chatList.value[0]
      message.role = 'error'
      message.content = event.message || 'An error occurred'
    }
    isStreamLoad.value = false
    loading.value = false
  },
  onRunFinishedEvent(params) {
    console.log(params)
  },
})

const isMaximized = ref(false)

const resize = () => {
  isMaximized.value = window.innerWidth > 500
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
})

// 处理媒体卡片和音乐卡片的逻辑
interface MediaCardProps {
  movie?: {
    nasProps: unknown
    command?: 'play' | 'open'
  }
}

interface MusicCardProps {
  musicData?: {
    nasProps: unknown
    command?: 'play' | 'open'
  }
}

const handleMediaAndMusicCards = (component: ComponentData | undefined) => {
  if (!component) return

  if (component.toolName === 'MediaCard') {
    const props = component.props as MediaCardProps
    const nasProps = props?.movie?.nasProps
    const command = props?.movie?.command
    if (command && (command === 'play' || command === 'open')) {
      nextTick(() => {
        cloudWindow.sendEvent('openFileTest', nasProps)
      })
    }
  } else if (component.toolName === 'MusicCard') {
    const props = component.props as MusicCardProps
    const nasProps = props?.musicData?.nasProps
    const command = props?.musicData?.command
    if (command && (command === 'play' || command === 'open')) {
      nextTick(() => {
        cloudWindow.sendEvent('openFileTest', nasProps)
      })
    }
  }
}

const loading = ref(false)
const isStreamLoad = ref(false)

// 倒序渲染
const chatList = ref<ChatMessage[]>([
  {
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'TDesignAI',
    datetime: '今天16:38',
    content:
      '我是你的 AI 助手，你可以让我搜索歌曲、电影的名称。例如，"周杰伦的稻香"、"阿凡达水之道"。',
    role: 'assistant',
    id: 'xxxx',
  },
])

interface OperationOptions {
  content?: string
  [key: string]: unknown
}

const handleOperation = function (type: string, options?: OperationOptions) {
  console.log('handleOperation', type, options)
}

const operation = function (type: string, options?: OperationOptions) {
  console.log(type, options)
}

const clearConfirm = function () {
  chatList.value = []
}

const onStop = function () {}

const inputEnter = function (inputValue: string) {
  if (isStreamLoad.value || !inputValue) return

  // 获取历史消息并添加新消息
  const messages = chatList.value
    .slice()
    .reverse()
    .map((msg) => {
      return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }
    })
    .filter(
      (msg): msg is { id: string; role: 'user' | 'assistant'; content: string } =>
        msg.role === 'user' || msg.role === 'assistant',
    )

  // 添加新的用户消息
  messages.push({
    id: `user_${new Date().getTime().toString()}`,
    role: 'user',
    content: inputValue,
  })

  agent.setMessages(messages)

  handleData(inputValue)
}

// 使用 AG UI 的事件系统替代了原有的 SSE 处理逻辑

const handleData = async (inputValue: string) => {
  if (isStreamLoad.value) return

  try {
    // 添加用户消息
    const userMessage: ExtendedChatMessage = {
      avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
      name: '自己',
      datetime: new Date().toDateString(),
      content: inputValue,
      role: 'user',
    }
    chatList.value.unshift(userMessage)

    // 添加助手消息占位
    const assistantMessage: ExtendedChatMessage = {
      avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
      name: 'TDesignAI',
      datetime: new Date().toDateString(),
      content: '',
      role: 'assistant',
    }
    chatList.value.unshift(assistantMessage)

    await agent.runAgent({
      tools: [
        {
          name: 'setTheme',
          description: 'Set the theme for the application',
          parameters: {
            name: 'backgroundColor',
            description:
              'The background color to set. Must be a valid 16-bit hexadecimal color code starting with # (e.g., #FF0000 for red, #00FF00 for green, #0000FF for blue). Please ensure the color code is properly formatted.',
            required: true,
          },
        },
      ] as RunAgentInput['tools'],
      context: [],
      forwardedProps: {},
    })
  } catch (error: unknown) {
    console.error('Failed to send message:', error)
    if (chatList.value[0]) {
      const message = chatList.value[0]
      message.role = 'error'
      message.content = error instanceof Error ? error.message : 'Failed to send message'
    }
    isStreamLoad.value = false
    loading.value = false
  }
}
</script>

<style scoped lang="less">
/* 悬浮智能助手按钮样式 */
.ai-assistant-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 120px;
  height: 60px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 9999;
  overflow: hidden;

  /* 呼吸灯效果 */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #333333 0%, #444444 50%, #333333 100%);
    border-radius: 32px;
    opacity: 0.4;
    animation: pulse 2s infinite;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7);
    background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 50%, #2d2d2d 100%);

    &::before {
      animation: pulse-hover 1s infinite;
      background: linear-gradient(135deg, #444444 0%, #555555 50%, #444444 100%);
    }
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
    background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
  }

  .ai-icon {
    width: 24px;
    height: 24px;
    color: #ffffff;
    margin-right: 8px;
    transition: transform 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
  }

  .ai-text {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  &:hover .ai-icon {
    transform: rotate(10deg) scale(1.1);
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;

    &::before {
      border-radius: 50%;
    }

    .ai-text {
      display: none;
    }

    .ai-icon {
      margin-right: 0;
      width: 28px;
      height: 28px;
    }
  }
}

/* 呼吸灯动画 */
@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.4;
  }
}

@keyframes pulse-hover {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* 应用滚动条样式 */
::-webkit-scrollbar-thumb {
  background-color: var(--td-scrollbar-color);
}
::-webkit-scrollbar-thumb:horizontal:hover {
  background-color: var(--td-scrollbar-hover-color);
}
::-webkit-scrollbar-track {
  background-color: var(--td-scroll-track-color);
}

/* 确保对话框及其内容层级最高 */
:deep(.t-dialog) {
  z-index: 99999 !important;
}

:deep(.t-dialog__wrap) {
  z-index: 99999 !important;
}

:deep(.t-dialog__container) {
  z-index: 99999 !important;
}

:deep(.t-dialog__body) {
  z-index: 99999 !important;
  position: relative;
}

:deep(.t-chat) {
  z-index: 99999 !important;
  position: relative;
}

:deep(.t-chat__content) {
  z-index: 99999 !important;
  position: relative;
}

:deep(.t-chat__input) {
  z-index: 99999 !important;
  position: relative;
}

:deep(.t-chat__actions) {
  z-index: 99999 !important;
  position: relative;
}

/* 确保所有子元素都有最高层级 */
:deep(.t-dialog *) {
  z-index: 99999 !important;
}

/* 额外的强制层级设置 */
:deep(.t-dialog__wrap) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 99999 !important;
  pointer-events: none !important;
}

:deep(.t-dialog__container) {
  position: relative !important;
  z-index: 99999 !important;
  pointer-events: auto !important;
}

/* 确保对话框始终在最前面 */
.t-dialog {
  z-index: 99999 !important;
}
</style>
