import request from './request'

export function getQuestions(params: any) {
  return request.get('/questions', { params })
}

export function getQuestion(id: number) {
  return request.get(`/questions/${id}`)
}

export function createQuestion(data: any) {
  return request.post('/questions', data)
}

export function updateQuestion(id: number, data: any) {
  return request.put(`/questions/${id}`, data)
}

export function deleteQuestion(id: number) {
  return request.delete(`/questions/${id}`)
}

export function importWord(formData: FormData, chapterId?: number) {
  const params = chapterId ? { chapterId } : {}
  return request.post('/questions/import', formData, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
