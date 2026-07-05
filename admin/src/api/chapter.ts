import request from './request'

export function getChapters(tree?: boolean) {
  return request.get('/chapters', { params: tree ? { tree: '1' } : {} })
}

export function createChapter(data: { name: string; parentId?: number; sortOrder?: number }) {
  return request.post('/chapters', data)
}

export function updateChapter(id: number, data: any) {
  return request.put(`/chapters/${id}`, data)
}

export function deleteChapter(id: number) {
  return request.delete(`/chapters/${id}`)
}
