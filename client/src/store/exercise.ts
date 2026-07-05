import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExerciseStore = defineStore('exercise', () => {
  const currentChapterId = ref(0)
  const results = ref<Record<number, { userAnswer: string; isCorrect: boolean; correctAnswer: string; analysis: string }>>({})
  const questionCount = ref(0)

  function record(questionId: number, userAnswer: string, data: any) {
    results.value[questionId] = {
      userAnswer,
      isCorrect: data.isCorrect,
      correctAnswer: data.correctAnswer,
      analysis: data.analysis,
    }
  }

  function startSession(chapterId: number, count: number) {
    currentChapterId.value = chapterId
    results.value = {}
    questionCount.value = count
  }

  function getStats() {
    const all = Object.values(results.value)
    const correct = all.filter(r => r.isCorrect).length
    return {
      total: all.length,
      correct,
      wrong: all.length - correct,
      accuracy: all.length > 0 ? Math.round(correct / all.length * 100) : 0,
    }
  }

  function reset() {
    currentChapterId.value = 0
    results.value = {}
    questionCount.value = 0
  }

  return { currentChapterId, results, questionCount, record, startSession, getStats, reset }
})
