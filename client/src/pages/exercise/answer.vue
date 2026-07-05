<template>
  <div class="page">
    <div v-if="loading" class="sk-loading">
      <div class="sk-block w30"></div>
      <div class="sk-block h60 w100"></div>
      <div class="sk-block w80"></div>
      <div class="sk-block w50"></div>
      <div class="sk-block h120 w100"></div>
    </div>

    <!-- 模式选择 -->
    <div v-else-if="!started" class="mode-select">
      <div class="mode-header">
        <button class="back-btn" @click="goHome">← 返回首页</button>
        <h2>{{ isAllChapters ? '全部章节' : chapterName }}</h2>
      </div>
      <p class="q-count">{{ totalQuestions }} 道题目</p>

      <!-- 续期提示 -->
      <div v-if="savedSession" class="resume-card">
        <p>上次做到第 {{ savedSession.currentIdx + 1 }}/{{ savedSession.questions.length }} 题，是否继续？</p>
        <button class="btn" @click="resumeSession">继续上次</button>
        <button class="btn outline" @click="clearSaved">重新开始</button>
      </div>

      <div class="mode-section">
        <label>选择题目数：</label>
        <div class="count-options">
          <span v-for="n in countOptions" :key="n" class="count-btn" :class="{ active: selectedCount === n }" @click="selectedCount = n">{{ n }} 题</span>
          <span class="count-btn" :class="{ active: selectedCount === totalQuestions }" @click="selectedCount = totalQuestions">全部</span>
        </div>
      </div>

      <button class="btn" @click="startQuiz('sequential')">顺序练习</button>
      <button class="btn outline" @click="startQuiz('random')">随机组卷</button>
      <button class="btn exam" @click="startQuiz('exam')">📝 模拟考试</button>
    </div>

    <!-- 答题 -->
    <div v-else class="quiz-area">
      <!-- 顶栏：进度 + 返回首页 -->
      <div class="top-bar">
        <button class="btn-sm exit-btn" @click="handleExit">🏠 返回首页</button>
        <span class="timer" :class="{ urgent: examMode && timeLeft < 300 }">{{ examMode ? formatTime(timeLeft) : '' }}</span>
        <div class="progress-info">{{ currentIdx + 1 }} / {{ questions.length }}</div>
      </div>
      <div class="bar"><div class="fill" :style="{ width: (currentIdx / questions.length * 100) + '%' }"></div></div>

      <div class="q-card">
        <div class="q-header">
          <span class="tag" :class="'type-' + q.type">{{ typeLabel }}</span>
          <span class="star-btn" :class="{ active: isFav }" @click="toggleFav">{{ isFav ? '★' : '☆' }}</span>
        </div>
        <div class="q-text">{{ q.content }}</div>

        <!-- 单选 -->
        <div v-if="q.type === 1" class="options">
          <div v-for="opt in q.options" :key="opt.label" class="option"
            :class="getOptionClass(opt.label)" @click="selectSingle(opt.label)">
            <span class="opt-label">{{ opt.label }}</span>{{ opt.content }}
          </div>
        </div>

        <!-- 多选 -->
        <div v-if="q.type === 2" class="options">
          <div v-for="opt in q.options" :key="opt.label" class="option"
            :class="getOptionClass(opt.label)" @click="toggleMulti(opt.label)">
            <span class="opt-label">{{ opt.label }}</span>{{ opt.content }}
          </div>
        </div>

        <!-- 判断 -->
        <div v-if="q.type === 3" class="options row2">
          <div class="option" :class="getOptionClass('正确')" @click="selectSingle('正确')">正确</div>
          <div class="option" :class="getOptionClass('错误')" @click="selectSingle('错误')">错误</div>
        </div>

        <!-- 练习模式：提交答案按钮 -->
        <button v-if="!examMode && !submitted && canSubmit" class="btn" @click="submitMyAnswer">提交答案</button>
        <!-- 考试模式：交卷按钮 -->
        <button v-if="examMode && canSubmitAll" class="btn exam-submit" @click="submitExam">📝 交卷</button>
      </div>

      <!-- 练习模式：即时反馈 -->
      <div v-if="!examMode && submitted" class="feedback" :class="result?.isCorrect ? 'correct' : 'wrong'">
        <div class="fb-icon">{{ result?.isCorrect ? '✓ 正确' : '✗ 错误' }}</div>
        <div v-if="!result?.isCorrect" class="fb-answer">正确答案: {{ result?.correctAnswer }}</div>
        <div v-if="result?.analysis" class="fb-analysis"><strong>解析:</strong> {{ result.analysis }}</div>
      </div>

      <div class="nav-row">
        <button class="card-btn" @click="showCard = !showCard">📋 答题卡</button>
      </div>

      <!-- 练习模式导航 -->
      <div v-if="!examMode && submitted" class="nav-btns">
        <button class="btn" :disabled="currentIdx === 0" @click="goPrev">上一题</button>
        <button class="btn primary" @click="goNext">{{ currentIdx === questions.length - 1 ? '完成' : '下一题' }}</button>
      </div>
      <!-- 考试模式导航（不依赖 submitted） -->
      <div v-if="examMode" class="nav-btns">
        <button class="btn" :disabled="currentIdx === 0" @click="goPrev">上一题</button>
        <button class="btn primary" @click="goNext">下一题</button>
      </div>
    </div>

    <!-- 答题卡弹窗 -->
    <div v-if="showCard" class="card-overlay" @click.self="showCard = false">
      <div class="card-modal">
        <div class="card-header">
          <span>答题卡</span>
          <span class="card-close" @click="showCard = false">✕</span>
        </div>
        <div class="card-grid">
          <div v-for="(_, idx) in questions" :key="idx" class="card-num"
            :class="getCardClass(idx)"
            @click="jumpTo(idx)">
            {{ idx + 1 }}
          </div>
        </div>
        <div class="card-legend">
          <span><span class="dot green"></span> 已答</span>
          <span><span class="dot red"></span> 错误</span>
          <span><span class="dot gray"></span> 未答</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuestions, getChapters, submitAnswer as apiSubmit, addFavorite, removeFavorite, checkFavorite } from '@/api/index'
import { useExerciseStore } from '@/store/exercise'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const exStore = useExerciseStore()
const userStore = useUserStore()

const SAVE_KEY = 'quiz_saved_session'

const chapterId = ref(Number(route.query.chapterId) || 0)
const isAllChapters = ref(!route.query.chapterId)
const countOpt = Number(route.query.count) || 0
const chapterName = ref('')
const questions = ref([])
const totalQuestions = ref(0)
const loading = ref(true)
const started = ref(false)
const currentIdx = ref(0)
const singleAnswer = ref('')
const multiAnswer = ref([])
const submitted = ref(false)
const result = ref(null)
const selectedCount = ref(countOpt || 20)
const savedSession = ref(null)
const countOptions = [10, 20, 30, 50]
const showCard = ref(false)
const isFav = ref(false)
const examMode = ref(false)
const timeLeft = ref(7200) // 120 分钟 = 7200 秒
let timerHandle = null

const q = computed(() => questions.value[currentIdx.value] || { content: '' })
const canSubmit = computed(() => {
  if (!q.value) return false
  if (q.value.type === 2) return multiAnswer.value.length > 0
  return singleAnswer.value !== ''
})
const typeLabel = computed(() => ({ 1: '单选题', 2: '多选题', 3: '判断题' }[q.value.type] || ''))
const canSubmitAll = computed(() => examMode.value && Object.keys(exStore.results).length > 0)

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m + ':' + (sec < 10 ? '0' : '') + sec
}

onMounted(async () => {
  loading.value = true
  try {
    const params = isAllChapters.value ? { mode: 'random', limit: 9999 } : { chapterId: chapterId.value, mode: 'sequential', pageSize: 999 }
    const [qRes, cRes] = await Promise.all([
      getQuestions(params),
      getChapters(),
    ])
    questions.value = Array.isArray(qRes.data) ? qRes.data : (qRes.data?.list || [])
    totalQuestions.value = questions.value.length
    if (selectedCount.value > totalQuestions.value) selectedCount.value = totalQuestions.value
    if (!isAllChapters.value) {
      const ch = cRes.data?.find(c => c.id === chapterId.value)
      if (ch) chapterName.value = ch.name
    }

    // 检查是否有上次未完成的练习
    checkSavedSession()
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

function checkSavedSession() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    // 同一章节、未完成的才提示
    if (saved.chapterId === chapterId.value && saved.currentIdx < saved.questions.length - 1) {
      savedSession.value = saved
    }
  } catch {}
}

function clearSaved() {
  localStorage.removeItem(SAVE_KEY)
  savedSession.value = null
}

function resumeSession() {
  if (!savedSession.value) return
  const saved = savedSession.value
  chapterName.value = saved.chapterName || chapterName.value
  questions.value = saved.questions
  started.value = true
  exStore.startSession(chapterId.value, questions.value.length)
  currentIdx.value = saved.currentIdx
  // 恢复已答记录
  if (saved.answers) {
    Object.entries(saved.answers).forEach(([qid, ans]) => {
      exStore.record(Number(qid), ans.userAnswer, ans)
    })
  }
  reset()
  clearSaved()
}
  // 切换题目时检查收藏状态
  watch(() => q.value?.id, async (id) => {
  if (!id || !userStore.token) return
  try {
    const res = await checkFavorite(id)
    isFav.value = res.data?.favorited || false
  } catch {}
})

async function toggleFav() {
  if (!q.value?.id) return
  try {
    if (isFav.value) {
      await removeFavorite(q.value.id)
      isFav.value = false
    } else {
      await addFavorite(q.value.id)
      isFav.value = true
    }
  } catch {}
}

function startQuiz(mode) {
  started.value = true
  let count = selectedCount.value
  if (mode === 'exam') {
    count = 100 // 考试固定 100 题
    examMode.value = true
    timeLeft.value = 7200
    // 启动计时器
    timerHandle = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        submitExam()
      }
    }, 1000)
  }
  exStore.startSession(chapterId.value, Math.min(count, questions.value.length))
  if (mode === 'random' || mode === 'exam') {
    questions.value = [...questions.value].sort(() => Math.random() - 0.5)
  }
  if (count < questions.value.length) {
    questions.value = questions.value.slice(0, count)
  }
  reset()
}

async function submitExam() {
  // 停止计时器
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  // 提交所有已答题目
  const ids = Object.keys(exStore.results)
  for (const qid of ids) {
    const ans = exStore.results[qid]
    if (!ans._submitted) {
      try {
        await apiSubmit(Number(qid), ans.userAnswer)
        ans._submitted = true
      } catch {}
    }
  }
  // 跳转到结果页
  const stats = exStore.getStats()
  router.push({ path: '/result', query: { total: stats.total, correct: stats.correct, accuracy: stats.accuracy, exam: '1', time: (7200 - timeLeft.value) } })
}

function saveSession() {
  // 只保存未完成的
  if (currentIdx.value >= questions.value.length - 1 && submitted.value) return
  try {
    const answers = {}
    Object.entries(exStore.results).forEach(([qid, data]) => {
      answers[qid] = data
    })
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      chapterId: chapterId.value,
      chapterName: chapterName.value,
      questions: questions.value,
      currentIdx: currentIdx.value,
      answers,
      savedAt: Date.now(),
    }))
  } catch {}
}

function handleExit() {
  if (currentIdx.value > 0 || Object.keys(exStore.results).length > 0) {
    saveSession()
  }
  router.push('/home')
}

function goHome() {
  router.push('/home')
}

function selectSingle(label) {
  if (submitted.value) return
  singleAnswer.value = label
  multiAnswer.value = []
}

function toggleMulti(label) {
  if (submitted.value) return
  const idx = multiAnswer.value.indexOf(label)
  if (idx > -1) multiAnswer.value.splice(idx, 1)
  else multiAnswer.value.push(label)
}

function getOptionClass(label) {
  const classes = []
  if (q.value.type === 2) {
    if (multiAnswer.value.includes(label)) classes.push('selected')
  } else {
    if (singleAnswer.value === label) classes.push('selected')
  }
  if (submitted.value) {
    if (q.value.answer.includes(label)) classes.push('correct')
    if ((q.value.type === 2 ? multiAnswer.value.includes(label) : singleAnswer.value === label) && !q.value.answer.includes(label)) classes.push('wrong')
  }
  return classes
}

async function submitMyAnswer() {
  const answer = q.value.type === 2 ? multiAnswer.value.sort().join(',') : singleAnswer.value
  try {
    const res = await apiSubmit(q.value.id, answer)
    if (res.code === 200 || res.code === 201) {
      result.value = res.data
      submitted.value = true
      exStore.record(q.value.id, answer, res.data)
      // 自动保存进度
      saveSession()
    }
  } catch (e) { console.error(e) }
}

function goNext() {
  if (currentIdx.value < questions.value.length - 1) {
    currentIdx.value++
    reset()
  } else {
    clearSaved()
    const stats = exStore.getStats()
    router.push({ path: '/result', query: { total: stats.total, correct: stats.correct, accuracy: stats.accuracy } })
  }
}

function goPrev() {
  if (currentIdx.value > 0) {
    currentIdx.value--
    reset()
  }
}

function getCardClass(idx) {
  const qid = questions.value[idx]?.id
  if (!qid) return ''
  const ans = exStore.results[qid]
  if (!ans) return 'unanswered'
  return ans.isCorrect ? 'correct' : 'wrong'
}

function jumpTo(idx) {
  currentIdx.value = idx
  showCard.value = false
  reset()
}

function reset() {
  singleAnswer.value = ''
  multiAnswer.value = []
  submitted.value = false
  result.value = null
  const qid = q.value?.id
  if (qid && exStore.results[qid]) {
    const prev = exStore.results[qid]
    submitted.value = true
    result.value = { isCorrect: prev.isCorrect, correctAnswer: prev.correctAnswer, analysis: prev.analysis }
    if (q.value.type === 2) multiAnswer.value = prev.userAnswer.split(',').filter(Boolean)
    else singleAnswer.value = prev.userAnswer
  }
}
</script>

<style scoped>
.page { padding: 16px; min-height: 100vh; }
.loading { text-align: center; padding: 40px; color: #999; }
.sk-loading { padding: 40px 16px; }
.sk-block { height: 20px; background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; margin-bottom: 12px; }
.sk-block.h60 { height: 60px; }
.sk-block.h120 { height: 120px; }
.sk-block.w30 { width: 30%; }
.sk-block.w50 { width: 50%; }
.sk-block.w80 { width: 80%; }
.sk-block.w100 { width: 100%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.mode-select { text-align: center; padding-top: 24px; }
.mode-select h2 { font-size: 18px; color: #333; }
.mode-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.back-btn { background: none; border: none; font-size: 14px; color: #409eff; cursor: pointer; padding: 4px 8px; white-space: nowrap; }
.back-btn:hover { opacity: 0.8; }
.q-count { font-size: 14px; color: #999; margin: 8px 0 16px; }
.btn { width: 100%; height: 44px; background: #409eff; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 12px; }
.btn.outline { background: #fff; color: #409eff; border: 1px solid #409eff; }
.btn.exam { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
.btn.exam-submit { background: #f56c6c; color: #fff; }
.timer { font-size: 16px; font-weight: bold; color: #333; }
.timer.urgent { color: #f56c6c; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0.5; } }
.btn.primary { background: #409eff; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: default; }
.btn-sm { padding: 6px 12px; border-radius: 6px; border: 1px solid #ddd; background: #fff; font-size: 13px; cursor: pointer; }
.resume-card { background: #f0f9eb; border: 1px solid #67c23a; border-radius: 10px; padding: 12px; margin-bottom: 16px; }
.resume-card p { font-size: 14px; color: #333; margin-bottom: 8px; }
.resume-card .btn { margin-top: 4px; width: auto; display: inline-block; padding: 0 16px; height: 36px; line-height: 36px; font-size: 14px; }
.resume-card .btn.outline { margin-left: 8px; }
.mode-section { margin: 16px 0; text-align: left; }
.mode-section label { font-size: 14px; color: #666; display: block; margin-bottom: 8px; }
.count-options { display: flex; gap: 8px; flex-wrap: wrap; }
.count-btn { padding: 8px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; color: #666; cursor: pointer; }
.count-btn.active { border-color: #409eff; background: #ecf5ff; color: #409eff; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.exit-btn { color: #666; font-size: 14px; }
.exit-btn:hover { color: #f56c6c; }
.progress-info { font-size: 13px; color: #999; }
.bar { height: 4px; background: #e8e8e8; border-radius: 2px; margin-bottom: 8px; }
.fill { height: 100%; background: #409eff; border-radius: 2px; transition: width .3s; }
.q-card { background: #fff; border-radius: 12px; padding: 16px; }
.q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.star-btn { font-size: 22px; color: #ddd; cursor: pointer; user-select: none; }
.star-btn.active { color: #f7ba2a; }
.tag { font-size: 12px; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
.tag.type-1 { background: #ecf5ff; color: #409eff; }
.tag.type-2 { background: #fdf6ec; color: #e6a23c; }
.tag.type-3 { background: #f0f9eb; color: #67c23a; }
.q-text { font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 8px; }
.option { padding: 14px 12px; border: 1px solid var(--border, #e8e8e8); border-radius: var(--radius-md, 10px); margin-top: 8px; cursor: pointer; font-size: 15px; min-height: 44px; display: flex; align-items: center; gap: 8px; -webkit-tap-highlight-color: transparent; }
.option:active { opacity: 0.8; }
.option.selected { border-color: #409eff; background: #ecf5ff; }
.option.correct { border-color: #67c23a; background: #f0f9eb; }
.option.wrong { border-color: #f56c6c; background: #fef0f0; }
.opt-label { font-weight: bold; color: #666; margin-right: 6px; }
.row2 { display: flex; gap: 12px; }
.row2 .option { flex: 1; text-align: center; }
.feedback { border-radius: 12px; padding: 16px; margin-top: 12px; }
.feedback.correct { background: #f0f9eb; border-left: 4px solid #67c23a; }
.feedback.wrong { background: #fef0f0; border-left: 4px solid #f56c6c; }
.fb-icon { font-size: 18px; font-weight: bold; }
.correct .fb-icon { color: #67c23a; }
.wrong .fb-icon { color: #f56c6c; }
.fb-answer { font-size: 14px; color: #f56c6c; margin-top: 4px; }
.fb-analysis { font-size: 14px; color: #666; margin-top: 8px; padding: 8px; background: rgba(255,255,255,.6); border-radius: 6px; }
.nav-row { margin-top: 12px; }
.card-btn { width: 100%; height: 40px; background: #f5f7fa; border: 1px solid #e8e8e8; border-radius: 8px; font-size: 14px; color: #666; cursor: pointer; }
.card-btn:hover { border-color: #409eff; color: #409eff; }
.nav-btns { display: flex; gap: 12px; margin-top: 8px; }
.nav-btns .btn { flex: 1; margin-top: 0; }
.card-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.4); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
.card-modal { background: #fff; border-radius: 16px 16px 0 0; width: 100%; max-width: 500px; padding: 20px 16px 30px; max-height: 60vh; overflow-y: auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 16px; font-weight: bold; color: #333; }
.card-close { font-size: 18px; color: #999; cursor: pointer; padding: 4px; }
.card-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px; }
.card-num { text-align: center; padding: 8px 4px; border-radius: 8px; font-size: 14px; cursor: pointer; border: 1px solid #e8e8e8; color: #666; background: #fff; }
.card-num.correct { background: #f0f9eb; border-color: #67c23a; color: #67c23a; }
.card-num.wrong { background: #fef0f0; border-color: #f56c6c; color: #f56c6c; }
.card-num.unanswered { background: #fafafa; border-color: #eee; color: #bbb; }
.card-legend { display: flex; gap: 16px; justify-content: center; font-size: 12px; color: #999; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.dot.green { background: #67c23a; }
.dot.red { background: #f56c6c; }
.dot.gray { background: #ddd; }
</style>
