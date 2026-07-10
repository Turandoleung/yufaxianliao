<template>
  <div class="calendar-panel">
    <div class="calendar-header">
      <button class="calendar-nav-btn" @click="prevMonth">‹</button>
      <div class="calendar-selects">
        <select class="calendar-select" :value="currentYear" @change="changeYear($event.target.value)">
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }} 年</option>
        </select>
        <select class="calendar-select" :value="currentMonth" @change="changeMonth($event.target.value)">
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
      <button class="calendar-nav-btn" @click="nextMonth">›</button>
    </div>
    <div class="calendar-weekdays">
      <span class="calendar-weekday" v-for="w in weekdays" :key="w">{{ w }}</span>
    </div>
    <div class="calendar-grid">
      <button
        v-for="cell in calendarDays"
        :key="cell.dateKey"
        class="calendar-day"
        :class="{
          outside: !cell.isCurrentMonth,
          today: cell.isToday,
          selected: cell.dateKey === selectedDate
        }"
        @click="handleDayClick(cell)"
      >
        <span class="calendar-day-num">{{ cell.day }}</span>
        <span v-if="postCounts[cell.dateKey]" class="calendar-day-count">{{ postCounts[cell.dateKey] }}</span>
      </button>
    </div>
    <div v-if="selectedDate" class="calendar-footer">
      <button class="calendar-today-btn" @click="$emit('clear-date')">清除日期筛选</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getMonthCalendarDays, getPostCountByDate, getAvailableYears } from '../utils/time.js'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  selectedDate: { type: String, default: '' }
})
const emit = defineEmits(['select-date', 'clear-date'])

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const monthOptions = [
  { value: 0, label: '1 月' },
  { value: 1, label: '2 月' },
  { value: 2, label: '3 月' },
  { value: 3, label: '4 月' },
  { value: 4, label: '5 月' },
  { value: 5, label: '6 月' },
  { value: 6, label: '7 月' },
  { value: 7, label: '8 月' },
  { value: 8, label: '9 月' },
  { value: 9, label: '10 月' },
  { value: 10, label: '11 月' },
  { value: 11, label: '12 月' }
]

const availableYears = computed(() => getAvailableYears(props.posts))
const calendarDays = computed(() => getMonthCalendarDays(currentYear.value, currentMonth.value))
const postCounts = computed(() => getPostCountByDate(props.posts))

function changeYear(val) {
  currentYear.value = Number(val)
  emit('clear-date')
}

function changeMonth(val) {
  currentMonth.value = Number(val)
  emit('clear-date')
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  emit('clear-date')
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  emit('clear-date')
}

function handleDayClick(cell) {
  if (cell.dateKey === props.selectedDate) {
    emit('clear-date')
  } else {
    emit('select-date', cell.dateKey)
  }
}
</script>