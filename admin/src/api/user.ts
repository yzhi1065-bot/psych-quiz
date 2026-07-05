import request from './request'

export function getUsers(page = 1, pageSize = 20) {
  return request.get('/users/list', { params: { page, pageSize } })
}
