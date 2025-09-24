import request from 'supertest'
import { createServer } from '../src/server'

const app = createServer()

describe('health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })
})
