<template>
  <div
    v-if="!musicData.command || musicData.command === 'none'"
    class="music-card"
    @click="handleClick"
  >
    <t-card :bordered="false" :hover-shadow="true" class="music-card-container">
      <!-- 音乐封面 -->
      <div class="music-cover">
        <t-image
          :src="musicData.cover"
          :alt="musicData.title"
          class="cover-image"
          :error="coverError"
          :loading="coverLoading"
        />
        <div class="cover-overlay">
          <t-button variant="text" size="large" @click="togglePlay" class="play-btn">
            <template #icon>
              <play-circle-filled-icon v-if="!isPlaying" />
              <pause-circle-filled-icon v-else />
            </template>
          </t-button>
        </div>
      </div>

      <!-- 音乐信息 -->
      <div class="music-info">
        <div class="music-title">
          <t-tooltip :content="musicData.title">
            <span class="title-text">{{ musicData.title }}</span>
          </t-tooltip>
        </div>
        <div class="music-artist">
          <t-tooltip :content="musicData.artist">
            <span class="artist-text">{{ musicData.artist }}</span>
          </t-tooltip>
        </div>
        <div class="music-duration">
          <t-tag variant="light" size="small">
            {{ formatDuration(musicData.duration) }}
          </t-tag>
        </div>
      </div>

      <!-- 快捷操作按钮 -->
      <div class="music-actions">
        <t-button
          variant="text"
          size="small"
          @click="toggleFavorite"
          :class="{ 'favorite-active': isFavorite }"
        >
          <template #icon>
            <heart-filled-icon v-if="isFavorite" />
            <heart-icon v-else />
          </template>
        </t-button>

        <t-button variant="text" size="small" @click="addToPlaylist">
          <template #icon>
            <list-icon />
          </template>
        </t-button>

        <t-button variant="text" size="small" @click="shareMusic">
          <template #icon>
            <share-icon />
          </template>
        </t-button>

        <t-dropdown :options="moreOptions" @click="handleMoreAction">
          <t-button variant="text" size="small">
            <template #icon>
              <more-icon />
            </template>
          </t-button>
        </t-dropdown>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import {
  Card as TCard,
  Image as TImage,
  Button as TButton,
  Tooltip as TTooltip,
  Tag as TTag,
  Dropdown as TDropdown,
  MessagePlugin,
} from 'tdesign-vue-next'
import {
  PlayCircleFilledIcon,
  PauseCircleFilledIcon,
  HeartFilledIcon,
  HeartIcon,
  ListIcon,
  ShareIcon,
  MoreIcon,
} from 'tdesign-icons-vue-next'
import { defineMCPComponent } from '@mcp-synergy/vue'
// import cloudWindow from 'ugos-core/cloudWindow'
// import { useRouter } from 'vue-router'

// 定义组件属性
interface Props {
  musicData: {
    id: string
    title: string
    artist: string
    cover: string
    duration: number // 秒
    url?: string
    nasProps: {
      path: string
      name: string
      ext: string
      type: string
      desc: string
    }
    command?: 'play' | 'open' | 'none'
  }
  initialFavorite?: boolean
  initialPlaying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialFavorite: false,
  initialPlaying: false,
})

// 定义事件
const emit = defineEmits<{
  play: [music: Props['musicData']]
  pause: [music: Props['musicData']]
  favorite: [music: Props['musicData'], isFavorite: boolean]
  addToPlaylist: [music: Props['musicData']]
  share: [music: Props['musicData']]
  download: [music: Props['musicData']]
  viewDetails: [music: Props['musicData']]
}>()

// 响应式状态
const isPlaying = ref(props.initialPlaying)
const isFavorite = ref(props.initialFavorite)

// 封面加载状态
const coverError = ref('https://tdesign.gtimg.com/site/avatar.jpg')
const coverLoading = ref('https://tdesign.gtimg.com/site/avatar.jpg')

// 更多操作菜单
const moreOptions = ref([
  { content: '下载', value: 'download' },
  { content: '查看详情', value: 'details' },
  { content: '举报', value: 'report' },
])

// 切换播放状态
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    emit('play', props.musicData)
    MessagePlugin.success('开始播放')
  } else {
    emit('pause', props.musicData)
    MessagePlugin.info('暂停播放')
  }
}

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  emit('favorite', props.musicData, isFavorite.value)
  MessagePlugin.success(isFavorite.value ? '已添加到收藏' : '已取消收藏')
}

// 添加到播放列表
const addToPlaylist = () => {
  emit('addToPlaylist', props.musicData)
  MessagePlugin.success('已添加到播放列表')
}

// 分享音乐
const shareMusic = () => {
  emit('share', props.musicData)
  MessagePlugin.success('分享链接已复制')
}

// 处理更多操作
const handleMoreAction = (option: any) => {
  switch (option.value) {
    case 'download':
      emit('download', props.musicData)
      MessagePlugin.success('开始下载')
      break
    case 'details':
      emit('viewDetails', props.musicData)
      break
    case 'report':
      MessagePlugin.warning('举报功能开发中')
      break
  }
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 组件挂载时的初始化
onMounted(() => {
  // 可以在这里执行一些初始化操作
})

// const router = useRouter()

const handleClick = () => {
  // router.push('/music')
  // console.log('handleClick', props.musicData.nasProps)
  // @ts-ignore
  cloudWindow.sendEvent('openFileTest', toRaw(props.musicData.nasProps))
}

defineMCPComponent({
  name: 'MusicCard',
  serverName: 'mcp-component-render',
  description: '音乐卡片组件，用于展示音乐的基本信息并提供播放、收藏、分享等交互功能。',
  pickProps: ['musicData'],
  inputSchema: {
    required: ['title'],
    properties: {
      command: {
        enum: ['play', 'open', 'none'],
        description:
          '音乐操作命令 enum, play: 播放音乐,open: 打开音乐,none: 查询或者搜索或者无操作命令',
        default: 'none',
      },
      title: {
        description:
          '音乐标题，必填字段。参数名必须保持为"title"，不得翻译为其他语言。title 不能包含 电影 字符串',
      },
    },
  },
})
</script>

<style scoped lang="less">
.music-card {
  margin: 8px;

  .music-card-container {
    width: 280px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  .music-cover {
    position: relative;
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;

      .play-btn {
        color: white;
        font-size: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
      }
    }

    &:hover .cover-overlay {
      opacity: 1;
    }
  }

  .music-info {
    margin-bottom: 12px;

    .music-title {
      margin-bottom: 4px;

      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .music-artist {
      margin-bottom: 8px;

      .artist-text {
        font-size: 14px;
        color: #6b7280;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .music-duration {
      display: flex;
      justify-content: flex-start;
    }
  }

  .music-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;

    .favorite-active {
      color: #ef4444;
    }

    .t-button {
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}
</style>
