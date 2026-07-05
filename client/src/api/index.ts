import http from './request'

export function authLogin(phone, password) {
  return http.post('/auth/login', { phone, password })
}

export function getProfile() {
  return http.get('/auth/profile')
}

export function getChapters() {
  return http.get('/chapters')
}

export function getQuestions(params) {
  return http.get('/questions', { params })
}

export function getQuestion(id) {
  return http.get(`/questions/${id}`)
}

export function submitAnswer(questionId, userAnswer) {
  return http.post('/answer/submit', { questionId, userAnswer })
}

export function getMistakes(chapterId) {
  return http.get('/answer/mistakes', { params: chapterId ? { chapterId } : {} })
}

export function removeMistake(questionId) {
  return http.delete(`/answer/mistakes/${questionId}`)
}

export function clearAllMistakes() {
  return http.delete('/answer/mistakes/clear')
}

export function getStats() {
  return http.get('/answer/stats')
}

export function addFavorite(questionId) {
  return http.post('/answer/favorites', { questionId })
}

export function removeFavorite(questionId) {
  return http.delete('/answer/favorites/' + questionId)
}

export function getFavorites(chapterId) {
  return http.get('/answer/favorites', { params: chapterId ? { chapterId } : {} })
}

export function checkFavorite(questionId) {
  return http.get('/answer/favorites/check/' + questionId)
}

export function getCalendar() {
  return http.get('/answer/calendar')
}
