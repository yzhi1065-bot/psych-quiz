import request from './request'

export function login(data: { phone: string; password: string }) {
  return request.post('/auth/login', data)
}

export function getProfile() {
  return request.get('/auth/profile')
}
