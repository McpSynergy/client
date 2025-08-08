<template>
  <div v-if="!movie?.command || movie?.command === 'none'" class="media-card" @click="handleClick">
    <div class="media-card-header">
      <div class="media-card-cover">
        <img :src="movie?.poster" :alt="movie?.title" />
      </div>
    </div>

    <div class="media-card-content">
      <h3 class="media-card-title">{{ movie?.title ?? '' }}</h3>
      <p class="media-card-description">{{ movie?.description ?? '' }}</p>

      <div class="media-card-meta">
        <div class="meta-item">
          <CalendarIcon size="16" />
          <span>{{ movie?.year }}</span>
        </div>
        <div class="meta-item">
          <TimeIcon size="16" />
          <span>{{ movie?.duration }}</span>
        </div>
        <div class="meta-item">
          <StarIcon size="16" />
          <span>{{ movie?.rating }}</span>
        </div>
      </div>

      <div class="media-card-actions">
        <button class="action-btn primary" @click="playMovie">
          <PlayIcon size="18" />
          <span>立即观看</span>
        </button>
        <!-- <button class="action-btn secondary" @click="addToWatchlist">
          <HeartIcon size="18" :class="{ 'heart-icon': true, active: isInWatchlist }" />
          <span>{{ isInWatchlist ? '已收藏' : '加入收藏' }}</span>
        </button>
        <button class="action-btn secondary" @click="shareMovie">
          <ShareIcon size="18" />
          <span>分享</span>
        </button> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { PlayIcon, CalendarIcon, TimeIcon, StarIcon } from 'tdesign-icons-vue-next'
import { defineMCPComponent } from '@mcp-synergy/vue'
import cloudWindow from 'ugos-core/cloudWindow'

interface Movie {
  id: number
  title: string
  description: string
  poster: string
  year: string
  duration: string
  rating: string
  genre: string[]
  nasProps: {
    path: string
    name: string
    ext: string
    type: string
  }
  command?: 'play' | 'open' | 'none'
}

const props = defineProps<{
  movie: Movie
}>()

const movie = computed(() => props.movie)

// const isInWatchlist = ref(false)

const emit = defineEmits<{
  play: [movie: Movie]
  addToWatchlist: [movie: Movie]
  share: [movie: Movie]
}>()

const playMovie = () => {
  emit('play', props.movie)
  console.log('playMovie', props.movie.nasProps)
  cloudWindow.sendEvent('openFileTest', toRaw(props.movie.nasProps))
}

const handleClick = () => {
  // router.push('/media')
  console.log('handleClick', props)
  cloudWindow.sendEvent('openFileTest', props.movie.nasProps)
  cloudWindow.sendEvent('openFileTest', toRaw(props.movie.nasProps))
}

defineMCPComponent({
  name: 'MediaCard',
  serverName: 'mcp-component-render',
  description: '电影卡片组件，用于展示电影的基本信息并提供播放、收藏、分享等交互功能。',
  pickProps: ['movie'],
  inputSchema: {
    required: ['title'],
    properties: {
      title: {
        description:
          '电影标题，必填字段。参数名必须保持为"title"，不得翻译为其他语言。title 不能包含 电影 字符串',
      },
      command: {
        enum: ['play', 'open', 'none'],
        description:
          '电影操作命令 enum, play: 播放电影,open: 打开电影,none: 查询或者搜索或者无操作命令',
        default: 'none',
      },
    },
  },
})
</script>

<style scoped>
.media-card {
  width: 320px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.media-card-header {
  position: relative;
  overflow: hidden;
}

.media-card-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.media-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-card:hover .media-card-cover img {
  transform: scale(1.05);
}

.media-card-content {
  padding: 20px;
}

.media-card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.media-card-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-card-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.meta-item span {
  font-weight: 500;
}

.media-card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #0052d9;
  color: white;
  flex: 1;
}

.action-btn.primary:hover {
  background: #003bb7;
}

.action-btn.secondary {
  background: #f3f3f3;
  color: #666;
  border: 1px solid #e7e7e7;
}

.action-btn.secondary:hover {
  background: #e7e7e7;
  color: #333;
}

.action-btn .heart-icon.active {
  color: #e34d59;
}

@media (max-width: 768px) {
  .media-card {
    width: 100%;
    max-width: 320px;
  }

  .media-card-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}
</style>
