<template>
  <div class="page">
    <h3 class="title">练习日历</h3>
    <div class="stat-row">
      <span>本月做题: <b>{{ monthTotal }}</b></span>
      <span>连续: <b>{{ streak }}</b> 天</span>
    </div>

    <div v-if="months.length" class="calendar" v-for="(m, mi) in months" :key="mi">
      <div class="month-label">{{ m.label }}</div>
      <div class="weekdays">
        <span v-for="d in weekDays" :key="d">{{ d }}</span>
      </div>
      <div class="grid">
        <span v-for="(day, i) in m.days" :key="i" class="day"
          :class="dayClass(day.count)"
          :title="day.date + ': ' + (day.count || 0) + ' 题'">
          <span v-if="day.count > 0 || (day.date && !day.future)"></span>
          <span v-else-if="day.date" class="day-num">{{ day.num }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCalendar } from '@/api/index'

const months = ref([])
const monthTotal = ref(0)
const streak = ref(0)
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

onMounted(async () => {
  try {
    const res = await getCalendar()
    const dayMap = res.data?.days || {}
    buildCalendar(dayMap)
  } catch {}
})

function buildCalendar(dayMap) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  months.value = []
  let total = 0
  let currentStreak = 0

  // 生成最近 3 个月
  for (let offset = 2; offset >= 0; offset--) {
    let m = month - offset
    let y = year
    if (m < 0) { m += 12; y-- }

    const firstDay = new Date(y, m, 1)
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    // 第一天是星期几（0=周日，我们想周一=0）
    let startWeekday = firstDay.getDay() - 1
    if (startWeekday < 0) startWeekday = 6

    const days = []
    // 填充空白
    for (let i = 0; i < startWeekday; i++) {
      days.push({ count: 0, date: '', num: '', future: true })
    }
    // 填充日期
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const count = dayMap[dateStr] || 0
      const future = compareDate(dateStr, now) > 0
      days.push({ count, date: dateStr, num: d, future })

      const todayStr = dateToStr(now)
      if (compareDate(dateStr, now) <= 0) {
        total += count
        if (count > 0) {
          if (currentStreak >= 0) currentStreak++
        } else {
          if (compareDate(dateStr, todayStr) < 0) currentStreak = 0
        }
      }
    }

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    months.value.push({ label: `${y}年${monthNames[m]}`, days })
  }

  monthTotal.value = total
  streak.value = currentStreak
}

function dayClass(count) {
  if (count === 0) return 'level-0'
  if (count <= 5) return 'level-1'
  if (count <= 15) return 'level-2'
  if (count <= 30) return 'level-3'
  return 'level-4'
}

function dateToStr(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function compareDate(a, b) {
  if (typeof b === 'string') return a.localeCompare(b)
  return a.localeCompare(dateToStr(b))
}
</script>

<style scoped>
.page { padding: 16px; }
.title { font-size: 16px; color: #333; margin-bottom: 8px; }
.stat-row { display: flex; justify-content: space-between; font-size: 14px; color: #666; margin-bottom: 20px; }
.calendar { margin-bottom: 24px; }
.month-label { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px; }
.weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; }
.weekdays span { text-align: center; font-size: 11px; color: #999; }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.day { aspect-ratio: 1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; position: relative; }
.day-num { color: #ccc; font-size: 10px; position: absolute; bottom: 1px; right: 2px; }
.level-0 { background: #f5f5f5; }
.level-1 { background: #c6e48b; }
.level-2 { background: #7bc96f; }
.level-3 { background: #239a3b; }
.level-4 { background: #196127; }
</style>
