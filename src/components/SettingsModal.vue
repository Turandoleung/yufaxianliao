﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="settings-overlay" @click.self="handleClose">
    <div class="settings-modal">
      <div class="settings-header">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <span class="settings-title">设置</span>
        <button class="btn-save" @click="handleSave">保存</button>
      </div>

      <div class="settings-body">
        <div class="settings-section">
          <label class="section-label">DeepSeek API Key</label>
          <p class="section-hint">用于生成先贤评论和素材池内容，API Key 仅保存在本地浏览器中。</p>
          <div class="api-key-row">
            <input
              type="password"
              class="settings-input"
              v-model="apiKey"
              :placeholder="hasExistingKey ? maskedPlaceholder : 'sk-...'"
              @focus="onApiKeyFocus"
            />
            <button
              v-if="hasExistingKey"
              class="clear-key-btn"
              @click="handleClearApiKey"
            >清除</button>
          </div>
          <p v-if="keyCleared" class="key-warning">已清除，保存后生效。清空后将不再生成先贤评论。</p>
          <p v-if="hasExistingKey && apiKey && !isMaskedValue" class="key-status">&#10003; 新 Key 将在保存后生效</p>
          <p v-if="hasExistingKey && apiKey && isMaskedValue" class="key-status">&#10003; API Key 已保存：{{ maskedPlaceholder }}</p>
        </div>

        <div class="settings-divider"></div>

        <div class="settings-section">
          <label class="section-label">点评风格</label>
          <p class="section-hint">控制先贤评论和回复的语气，不影响本地点赞和资料卡。</p>
          <select class="setting-select" v-model="commentTone">
            <option value="gentle">温和</option>
            <option value="serious">严肃</option>
            <option value="sharp">犀利</option>
            <option value="poetic">诗意</option>
            <option value="jurisprudential">法理化</option>
          </select>
          <p class="tone-hint" v-if="commentTone === 'gentle'">先贤会更耐心、更像劝导。</p>
          <p class="tone-hint" v-if="commentTone === 'serious'">先贤会更强调原则和责任。</p>
          <p class="tone-hint" v-if="commentTone === 'sharp'">先贤会更直接、更有锋芒。</p>
          <p class="tone-hint" v-if="commentTone === 'poetic'">先贤会更有比喻和哲思感。</p>
          <p class="tone-hint" v-if="commentTone === 'jurisprudential'">先贤会更像法理学点评。</p>
        </div>

        <div class="settings-divider"></div>

        <div class="settings-section">
          <label class="section-label">评论长度</label>
          <p class="section-hint">简短更省 token，深度更适合需要展开分析的内容。</p>
          <select class="setting-select" v-model="commentLength">
            <option value="short">简短：50 字以内</option>
            <option value="standard">标准：80 字以内</option>
            <option value="deep">深度：150 字以内</option>
          </select>
          <p class="tone-hint" v-if="commentLength === 'short'">更省 token，适合轻量点评。</p>
          <p class="tone-hint" v-if="commentLength === 'standard'">默认长度，适合日常记录。</p>
          <p class="tone-hint" v-if="commentLength === 'deep'">分析更充分，但会消耗更多 token。</p>
        </div>

        <div class="settings-divider"></div>

        <div class="settings-section">
          <label class="setting-switch-row">
            <div class="switch-info">
              <div class="setting-title">先贤评论</div>
              <div class="setting-desc">发布动态后自动调用 DeepSeek 生成评论，开启后会消耗 token。</div>
            </div>
            <div class="switch-wrap">
              <input type="checkbox" class="toggle-checkbox" v-model="enableAiComment" />
              <div class="toggle-track" :class="{ active: enableAiComment }">
                <div class="toggle-thumb"></div>
              </div>
            </div>
          </label>
        </div>

        <div class="settings-section">
          <label class="section-label">先贤点赞频率</label>
          <p class="section-hint">控制发布动态后随机先贤点赞的数量，不消耗 token。</p>
          <select class="setting-select" v-model="aiLikeFrequency">
            <option value="off">关闭：不生成先贤点赞</option>
            <option value="low">低：随机 0-1 位</option>
            <option value="medium">中：随机 0-3 位</option>
            <option value="high">高：随机 2-5 位</option>
          </select>
          <p class="tone-hint" v-if="aiLikeFrequency === 'off'">发布后不会出现先贤点赞。</p>
          <p class="tone-hint" v-if="aiLikeFrequency === 'low'">比较克制，最多 1 位先贤点赞。</p>
          <p class="tone-hint" v-if="aiLikeFrequency === 'medium'">默认推荐，最多 3 位先贤点赞。</p>
          <p class="tone-hint" v-if="aiLikeFrequency === 'high'">互动更热闹，2-5 位先贤点赞。</p>
        </div>

        <div class="settings-divider"></div>

        <div class="settings-section">
          <label class="setting-switch-row">
            <div class="switch-info">
              <div class="setting-title">每日先贤动态</div>
              <div class="setting-desc">每天自动生成一条先贤法谚动态。</div>
            </div>
            <div class="switch-wrap">
              <input type="checkbox" class="toggle-checkbox" v-model="enableDailySagePost" />
              <div class="toggle-track" :class="{ active: enableDailySagePost }">
                <div class="toggle-thumb"></div>
              </div>
            </div>
          </label>
        </div>

        <div v-if="enableDailySagePost" class="settings-section">
          <label class="section-label">生成模式</label>
          <p class="section-hint">选择每日先贤动态的来源。</p>
          <div class="mode-selector">
            <button
              class="mode-btn"
              :class="{ active: dailySageMode === 'local' }"
              @click="dailySageMode = 'local'"
            >本地法谚库</button>
            <button
              class="mode-btn"
              :class="{ active: dailySageMode === 'pool' }"
              @click="dailySageMode = 'pool'"
            >DeepSeek 内容池</button>
            <button
              class="mode-btn"
              :class="{ active: dailySageMode === 'realtime' }"
              @click="dailySageMode = 'realtime'"
            >实时 DeepSeek</button>
          </div>
          <p class="mode-hint" v-if="dailySageMode === 'local'">不消耗 token，从导入的法谚库中随机取一条发布。</p>
          <p class="mode-hint" v-if="dailySageMode === 'pool'">推荐模式。平时不调用 DeepSeek，从本地素材池取一条发布。</p>
          <p class="mode-hint" v-if="dailySageMode === 'realtime'">每天调用一次 DeepSeek，最耗 token。</p>
        </div>

        <div v-if="enableDailySagePost && dailySageMode === 'local'" class="settings-section pool-section">
          <label class="section-label">本地法谚库</label>
          <div class="pool-stats">
            <span class="pool-stat-item">已导入：<strong>{{ localQuotesCount }}</strong> 条</span>
          </div>
          <p class="pool-hint">可导入 JSON 文件扩展本地法谚库，不消耗 token。导入内容仅保存在本机。</p>
          <div class="pool-actions">
            <button class="pool-supply-btn" @click="handleImportLocalQuotes">导入法谚库</button>
            <button class="pool-clear-btn" @click="handleDownloadTemplate">下载模板</button>
            <button v-if="localQuotesCount > 0" class="pool-clear-btn" @click="handleResetImportedUsage">重置使用记录</button>
            <button v-if="localQuotesCount > 0" class="pool-clear-btn pool-clear-danger" @click="handleClearLocalQuotes">清空导入法谚</button>
          </div>
          <input ref="fileInput" type="file" accept=".json,application/json" style="display:none" @change="onFileSelected" />
          <p v-if="localImportResult" class="pool-result">{{ localImportResult }}</p>
          <details class="format-details">
            <summary>查看 JSON 格式示例</summary>
            <pre class="format-code">{{ localQuotesTemplate }}</pre>
          </details>
        </div>

        <div class="settings-divider"></div>

        <div class="settings-section">
          <label class="section-label">数据管理</label>
          <p class="section-hint">导出或导入本地数据，避免更新 App 或换手机时数据丢失。导出文件默认不包含 DeepSeek API Key。</p>
          <div class="backup-actions">
            <button class="backup-btn" :disabled="isExporting" @click="handleExportBackup">{{ isExporting ? '正在导出…' : '导出数据' }}</button>
            <button class="backup-btn backup-import-btn" @click="handleImportBackup">导入数据</button>
          </div>
          <button class="reset-btn" @click="handleClearAllData">清除所有数据</button>
          <input ref="backupFileInput" type="file" accept=".json,application/json" style="display:none" @change="onBackupFileSelected" />
          <p v-if="backupResult" class="backup-result">{{ backupResult }}</p>
        </div>

        <div class="settings-divider"></div>

        <div class="settings-section">
          <label class="section-label">旧图片数据迁移</label>
          <p class="section-hint">将旧头像、背景图、动态图片、音乐封面和草稿图片迁移到手机文件存储，释放本地数据库空间。迁移前建议先导出数据备份。</p>
          <button
            class="migrate-btn"
            :disabled="isMigrating"
            @click="handleMigrateImages"
          >
            {{ isMigrating ? '迁移中...' : '迁移旧图片数据' }}
          </button>
          <p v-if="migrateResult" class="backup-result" :class="{ 'migrate-error': migrateError }">{{ migrateResult }}</p>
        </div>

        <div v-if="enableDailySagePost && dailySageMode === 'pool'" class="settings-section pool-section">
          <label class="section-label">DeepSeek 素材池</label>
          <div class="pool-stats">
            <span class="pool-stat-item">可用：<strong>{{ poolAvailable }}</strong> 条</span>
            <span class="pool-stat-item">已用：<strong>{{ poolUsed }}</strong> 条</span>
          </div>
          <p class="pool-hint">补充素材会调用一次 DeepSeek，生成未来多天的每日先贤动态。</p>
          <div class="pool-actions">
            <button
              class="pool-supply-btn"
              :disabled="(!apiKey && !hasExistingKey) || isSupplying"
              @click="handleSupplyPool"
            >{{ isSupplying ? '生成中...' : '补充 10 条素材' }}</button>
            <button
              v-if="poolUsed > 0"
              class="pool-clear-btn"
              @click="handleClearUsed"
            >清空已用</button>
          </div>
          <p v-if="!apiKey && !hasExistingKey" class="pool-warning">请先填写 DeepSeek API Key 后再补充素材。</p>
          <p v-if="supplyResult" class="pool-result">{{ supplyResult }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSettings, saveSettings, getDailySageMode, getPoolStats, addItemsToPool, clearUsedPoolItems } from '../services/settingsService.js'
import { exportBackup, importBackup } from '../services/backupService.js'
import { parseImportedQuotes, mergeImportedQuotes, getImportedQuoteCount, clearImportedQuotes, resetImportedQuotesUsage } from '../services/dailyQuoteImportService.js'
import { migrateLegacyImages } from '../services/migrateService.js'
import { isNativePlatform } from '../services/fileStorageService.js'
import { philosophers } from '../data/philosophers.js'
import { generateDailySagePoolItems } from '../services/aiService.js'

const emit = defineEmits(['close', 'saved'])

const apiKey = ref('')
const hasExistingKey = ref(false)
const isMaskedValue = ref(false)
const maskedPlaceholder = ref('')
const originalApiKey = ref('')
const keyCleared = ref(false)
const enableAiComment = ref(false)
const aiLikeFrequency = ref('medium')
const enableDailySagePost = ref(true)
const dailySageMode = ref('local')
const commentTone = ref('gentle')
const commentLength = ref('standard')
const isSupplying = ref(false)
const supplyResult = ref('')
const localQuotesCount = ref(0)
const localImportResult = ref('')
const fileInput = ref(null)
const showResetConfirm = ref(false)
const backupResult = ref('')
const isExporting = ref(false)
const backupFileInput = ref(null)
const isMigrating = ref(false)
const migrateResult = ref('')
const migrateError = ref(false)

const localQuotesTemplate = JSON.stringify([
  {
    philosopherId: 'ulpian',
    philosopherName: '乌尔比安',
    quote: '正义是给予每个人其应得之物。',
    explanation: '这句话提醒我们，法律不是情绪的宣泄，而是权利、责任和秩序的平衡。',
    inspiration: '今天遇事时，不妨先问：什么才是各得其所？',
    tags: ['罗马法', '正义', '法理']
  }
], null, 2)

const poolAvailable = computed(() => getPoolStats().available)
const poolUsed = computed(() => getPoolStats().used)

onMounted(() => {
  var settings = getSettings()
  var savedKey = settings.deepseekApiKey || ''
  if (savedKey) {
    hasExistingKey.value = true
    originalApiKey.value = savedKey
    var last4 = savedKey.length >= 4 ? savedKey.slice(-4) : savedKey
    maskedPlaceholder.value = 'sk-****' + last4
    apiKey.value = maskedPlaceholder.value
    isMaskedValue.value = true
  } else {
    apiKey.value = ''
  }
  enableAiComment.value = settings.enableAiComment === true
  aiLikeFrequency.value = settings.aiLikeFrequency || (settings.enableAiLikes === false ? 'off' : 'medium')
  enableDailySagePost.value = settings.enableDailySagePost !== false
  dailySageMode.value = settings.dailySageMode || 'local'
  commentTone.value = settings.commentTone || 'gentle'
  commentLength.value = settings.commentLength || 'standard'
  localQuotesCount.value = getImportedQuoteCount()
})

async function handleSupplyPool() {
  var effectiveKey = isMaskedValue.value ? originalApiKey.value : apiKey.value.trim()
  if (!effectiveKey) {
    supplyResult.value = '请先填写 API Key'
    return
  }
  isSupplying.value = true
  supplyResult.value = ''
  try {
    var items = await generateDailySagePoolItems({
      philosophers: philosophers,
      count: 10,
      apiKey: effectiveKey
    })
    addItemsToPool(items)
    supplyResult.value = '已补充 ' + items.length + ' 条素材'
  } catch (e) {
    supplyResult.value = '素材生成失败：' + (e.message || '请稍后再试')
  }
  isSupplying.value = false
}

function handleClearUsed() {
  clearUsedPoolItems()
  supplyResult.value = '已清空已用素材'
}

function handleImportLocalQuotes() {
  fileInput.value.click()
}

function onFileSelected(e) {
  var file = e.target.files[0]
  if (!file) return
  var reader = new FileReader()
  reader.onload = function(ev) {
    try {
      var newQuotes = parseImportedQuotes(ev.target.result)
      var result = mergeImportedQuotes(newQuotes)
      localQuotesCount.value = getImportedQuoteCount()
      if (result.imported === 0) {
        localImportResult.value = '所有法谚已存在，无新增'
      } else {
        localImportResult.value = '成功导入 ' + result.imported + ' 条法谚（共 ' + result.total + ' 条）'
      }
    } catch (err) {
      localImportResult.value = '导入失败：' + err.message
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function handleClearLocalQuotes() {
  if (!confirm('确定清空已导入的本地法谚吗？已生成的每日先贤动态不会被删除。')) return
  clearImportedQuotes()
  localQuotesCount.value = 0
  localImportResult.value = '已清空本地法谚库'
  showResetConfirm.value = false
}

function handleResetImportedUsage() {
  resetImportedQuotesUsage()
  localImportResult.value = '已重置所有导入法谚的使用记录'
}

function handleDownloadTemplate() {
  var blob = new Blob([localQuotesTemplate], { type: 'application/json' })
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a')
  a.href = url
  a.download = '法谚库模板.json'
  a.click()
  URL.revokeObjectURL(url)
}

function onApiKeyFocus() {
  if (isMaskedValue.value) {
    apiKey.value = ''
    isMaskedValue.value = false
  }
  keyCleared.value = false
}

function handleClearApiKey() {
  apiKey.value = ''
  isMaskedValue.value = false
  hasExistingKey.value = false
  originalApiKey.value = ''
  maskedPlaceholder.value = ''
  keyCleared.value = true
}

function handleSave() {
  var settings = getSettings()
  if (isMaskedValue.value) {
    // 用户未修改Key，保留原Key
  } else if (apiKey.value.trim() === '') {
    settings.deepseekApiKey = ''
  } else {
    settings.deepseekApiKey = apiKey.value.trim()
  }
  settings.enableAiComment = enableAiComment.value
  settings.aiLikeFrequency = aiLikeFrequency.value
  settings.enableAiLikes = aiLikeFrequency.value !== 'off'
  settings.enableDailySagePost = enableDailySagePost.value
  settings.dailySageMode = dailySageMode.value
  settings.commentTone = commentTone.value
  settings.commentLength = commentLength.value
  saveSettings(settings)
  emit('saved')
  emit('close')
}

function handleClose() {
  emit('close')
}

async function handleExportBackup() {
  if (isExporting.value) return
  isExporting.value = true
  backupResult.value = ''
  try {
    console.log("[backup] export button clicked")
    await exportBackup()
    backupResult.value = '备份文件已生成，请选择保存位置或分享方式。'
  } catch (e) {
    console.error("[backup] export failed", {
      name: e ? e.name : undefined,
      message: e ? e.message : undefined,
      stack: e ? e.stack : undefined
    })
    backupResult.value = '导出失败，请稍后重试。'
  } finally {
    isExporting.value = false
  }
}

function handleImportBackup() {
  backupFileInput.value.click()
}

function handleClearAllData() {
  if (!confirm('确定要清除所有本地数据吗？\n\n此操作将删除所有动态、评论、头像和设置，无法恢复！\n\n建议先导出数据备份。')) return
  if (!confirm('再次确认：真的要清除所有数据吗？')) return

  var keys = [
    'xianxianquan_posts',
    'xianxianquan_profile',
    'xianxianquan_settings',
    'xianxianquan_post_draft',
    'xianxianquan_daily_sage_pool',
    'xianxianquan_imported_daily_quotes'
  ]

  var failedKeys = []
  for (var i = 0; i < keys.length; i++) {
    try {
      localStorage.removeItem(keys[i])
    } catch (e) {
      failedKeys.push(keys[i])
    }
  }

  if (failedKeys.length > 0) {
    backupResult.value = '部分数据清除失败，请重新打开 App 后再试。'
  } else {
    location.reload()
  }
}

function onBackupFileSelected(e) {
  var file = e.target.files[0]
  if (!file) return
  var reader = new FileReader()
  reader.onload = function(ev) {
    if (!confirm('导入会覆盖当前本地数据，是否继续？')) {
      backupResult.value = ''
      return
    }
    var result = importBackup(ev.target.result)
    if (result.success) {
      backupResult.value = '导入成功，即将刷新页面…'
      setTimeout(function() { location.reload() }, 1000)
    } else {
      backupResult.value = '导入失败：' + result.error
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

async function handleMigrateImages() {
  if (!isNativePlatform()) {
    migrateResult.value = '网页端不需要迁移，此功能仅适用于 Android App。'
    migrateError.value = true
    return
  }

  if (!confirm('迁移前建议先导出数据备份。\n\n确定开始迁移旧图片数据吗？')) {
    return
  }

  isMigrating.value = true
  migrateResult.value = ''
  migrateError.value = false

  try {
    var result = await migrateLegacyImages(function(progress) {
      if (progress.stage === 'done') return
      migrateResult.value = '正在迁移：' + progress.stage
        + '（已迁移 ' + progress.migratedCount + '，失败 ' + progress.failedCount + '，跳过 ' + progress.skippedCount + '）'
    })

    if (result.failedCount === 0) {
      migrateResult.value = '旧图片迁移完成！已迁移 ' + result.migratedCount + ' 张图片，已释放本地存储空间。'
      migrateError.value = false
    } else {
      migrateResult.value = '迁移完成：成功 ' + result.migratedCount + ' 张，失败 ' + result.failedCount + ' 张，跳过 ' + result.skippedCount + ' 张。失败的原数据已保留。'
      migrateError.value = true
    }
  } catch (e) {
    migrateResult.value = '迁移失败：' + (e.message || '请稍后重试')
    migrateError.value = true
  } finally {
    isMigrating.value = false
  }
}
</script>

<style scoped>
.settings-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); z-index: 300;
  display: flex; align-items: center; justify-content: center; padding: 12px;
}
.settings-modal {
  width: 100%; max-width: 440px; background-color: #fff;
  border-radius: 16px; overflow: hidden; animation: fadeIn 0.2s ease;
  max-height: 90vh;
  display: flex; flex-direction: column;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.settings-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #EAEAEA;
}
.settings-title { font-size: 16px; font-weight: 600; color: #222; }
.btn-cancel { background: none; border: none; font-size: 15px; color: #888; cursor: pointer; }
.btn-save {
  background-color: #07C160; color: #fff; border: none;
  border-radius: 8px; padding: 6px 18px; font-size: 14px;
  font-weight: 500; cursor: pointer;
}
.btn-save:hover { background-color: #06ad56; }
.settings-body { padding: 20px; flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }

@media (max-width: 600px) {
  .settings-modal { border-radius: 14px 14px 0 0; margin-top: auto; max-height: 92vh; }
  .settings-body { padding: 16px; }
  .settings-header { padding: 14px 16px; }
  .settings-section { margin-bottom: 12px; }
  .settings-divider { margin: 14px 0; }
  .pool-actions { flex-wrap: wrap; gap: 6px; }
  .pool-supply-btn { padding: 7px 14px; font-size: 12px; white-space: nowrap; }
  .mode-selector { gap: 4px; }
  .mode-btn { padding: 6px 10px; font-size: 12px; }
}
.settings-section { margin-bottom: 16px; }
.section-label { display: block; font-size: 14px; font-weight: 600; color: #222; margin-bottom: 6px; }
.section-hint { font-size: 12px; color: #999; margin-bottom: 10px; line-height: 1.4; }
.api-key-row { display: flex; gap: 8px; }
.settings-input {
  flex: 1; border: 1px solid #EAEAEA; border-radius: 8px;
  padding: 10px 14px; font-size: 14px; color: #222; outline: none;
  transition: border-color 0.2s;
}
.settings-input:focus { border-color: #07C160; }
.clear-key-btn {
  background: none; border: 1px solid #e74c3c; border-radius: 8px;
  padding: 10px 14px; font-size: 13px; color: #e74c3c;
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
.clear-key-btn:hover { background: #fef0f0; }
.key-warning { font-size: 12px; color: #e74c3c; margin-top: 8px; }
.key-status { font-size: 12px; color: #07C160; margin-top: 8px; }
.settings-divider { height: 1px; background: #EAEAEA; margin: 20px 0; }
.setting-switch-row {
  display: flex; justify-content: space-between; align-items: center; gap: 16px; cursor: pointer;
}
.switch-info { flex: 1; min-width: 0; }
.setting-title { font-size: 14px; font-weight: 600; color: #222; margin-bottom: 4px; }
.setting-desc { font-size: 12px; color: #999; line-height: 1.4; }
.switch-wrap { flex-shrink: 0; position: relative; }
.toggle-checkbox { display: none; }
.toggle-track {
  width: 48px; height: 28px; border-radius: 14px;
  background: #ddd; position: relative; transition: background 0.25s; cursor: pointer;
}
.toggle-track.active { background: #07C160; }
.toggle-thumb {
  width: 22px; height: 22px; border-radius: 50%;
  background: #fff; position: absolute; top: 3px; left: 3px;
  transition: transform 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.toggle-track.active .toggle-thumb { transform: translateX(20px); }

.mode-selector { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.mode-btn {
  padding: 7px 14px; border: 1px solid #EAEAEA; border-radius: 8px;
  background: #fff; font-size: 13px; color: #555; cursor: pointer;
  transition: all 0.2s;
}
.mode-btn:hover { border-color: #07C160; color: #07C160; }
.mode-btn.active { border-color: #07C160; background: #f0faf0; color: #07C160; font-weight: 500; }
.mode-hint { font-size: 12px; color: #999; line-height: 1.4; margin-top: 4px; }

.pool-section { background: #F9F9F9; border-radius: 10px; padding: 14px; }
.pool-stats { display: flex; gap: 20px; margin-bottom: 10px; }
.pool-stat-item { font-size: 13px; color: #555; }
.pool-stat-item strong { color: #222; }
.pool-hint { font-size: 12px; color: #999; margin-bottom: 10px; line-height: 1.4; }
.pool-actions { display: flex; gap: 8px; align-items: center; }
.pool-supply-btn {
  background-color: #C9A96E; color: #fff; border: none;
  border-radius: 8px; padding: 8px 16px; font-size: 13px;
  font-weight: 500; cursor: pointer; transition: background-color 0.2s;
}
.pool-supply-btn:hover:not(:disabled) { background-color: #b8944f; }
.backup-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.backup-btn {
  background-color: #576B95;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.backup-btn:hover { background-color: #4a5d82; }
.backup-btn:disabled { background-color: #a0aec0; cursor: not-allowed; }
.backup-import-btn { background-color: #C9A96E; }
.backup-import-btn:hover { background-color: #b8944f; }
.backup-result {
  font-size: 13px;
  margin-top: 8px;
  color: #07C160;
}
.reset-btn {
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
}
.reset-btn:hover { background-color: #c0392b; }
.backup-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.backup-btn {
  background-color: #576B95;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.backup-btn:hover { background-color: #4a5d82; }
.backup-import-btn { background-color: #C9A96E; }
.backup-import-btn:hover { background-color: #b8944f; }
.backup-result {
  font-size: 13px;
  margin-top: 8px;
  color: #07C160;
}
.backup-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.backup-btn {
  background-color: #576B95;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.backup-btn:hover { background-color: #4a5d82; }
.backup-import-btn { background-color: #C9A96E; }
.backup-import-btn:hover { background-color: #b8944f; }
.backup-result {
  font-size: 13px;
  margin-top: 8px;
  color: #07C160;
}
.migrate-btn {
  background-color: #e67e22;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
}
.migrate-btn:hover { background-color: #d35400; }
.migrate-btn:disabled { background-color: #f0c090; cursor: not-allowed; }
.migrate-error { color: #e74c3c !important; }
.pool-supply-btn:disabled { background-color: #ddd; cursor: not-allowed; }
.pool-clear-btn {
  background: none; border: 1px solid #ddd; border-radius: 8px;
  padding: 8px 14px; font-size: 13px; color: #888; cursor: pointer;
  transition: all 0.2s;
}
.pool-clear-btn:hover { border-color: #e74c3c; color: #e74c3c; }
.pool-clear-danger { color: #e74c3c; border-color: #f5c6cb; }
.pool-clear-danger { color: #e74c3c; border-color: #f5c6cb; }
.pool-warning { font-size: 12px; color: #e74c3c; margin-top: 8px; }
.pool-result { font-size: 12px; color: #07C160; margin-top: 8px; }
.setting-select {
  width: 100%; height: 38px; border: 1px solid #e5e5e5;
  border-radius: 8px; padding: 0 10px; background: #fff;
  font-size: 14px; color: #222; outline: none;
  transition: border-color 0.2s; appearance: auto;
}
.setting-select:focus { border-color: #07C160; }
.tone-hint {
  font-size: 12px; color: #777; margin-top: 6px; line-height: 1.4;
}
.format-details {
  margin-top: 10px; font-size: 12px; color: #777;
}
.format-details summary {
  cursor: pointer; color: #07C160; user-select: none;
}
.format-details summary:hover {
  text-decoration: underline;
}
.format-code {
  margin-top: 6px; padding: 10px; background: #fff;
  border: 1px solid #e5e5e5; border-radius: 8px;
  font-size: 11px; line-height: 1.5; overflow-x: auto;
  white-space: pre-wrap; word-break: break-all;
}
.format-details {
  margin-top: 10px; font-size: 12px; color: #777;
}
.format-details summary {
  cursor: pointer; color: #07C160; user-select: none;
}
.format-details summary:hover {
  text-decoration: underline;
}
.format-code {
  margin-top: 6px; padding: 10px; background: #fff;
  border: 1px solid #e5e5e5; border-radius: 8px;
  font-size: 11px; line-height: 1.5; overflow-x: auto;
  white-space: pre-wrap; word-break: break-all;
}
.format-details {
  margin-top: 10px; font-size: 12px; color: #777;
}
.format-details summary {
  cursor: pointer; color: #07C160; user-select: none;
}
.format-details summary:hover {
  text-decoration: underline;
}
.format-code {
  margin-top: 6px; padding: 10px; background: #fff;
  border: 1px solid #e5e5e5; border-radius: 8px;
  font-size: 11px; line-height: 1.5; overflow-x: auto;
  white-space: pre-wrap; word-break: break-all;
}
.format-details {
  margin-top: 10px; font-size: 12px; color: #777;
}
.format-details summary {
  cursor: pointer; color: #07C160; user-select: none;
}
.format-details summary:hover {
  text-decoration: underline;
}
.format-code {
  margin-top: 6px; padding: 10px; background: #fff;
  border: 1px solid #e5e5e5; border-radius: 8px;
  font-size: 11px; line-height: 1.5; overflow-x: auto;
  white-space: pre-wrap; word-break: break-all;
}
</style>