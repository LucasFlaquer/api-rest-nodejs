import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('yarn knex migrate:rollback --all')
    execSync('yarn knex migrate:latest')
  })

  it('o usuario consegue criar uma transacaio', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new Transaction',
        amount: 4000,
        type: 'credit',
      })
      .expect(201)
  })
  it('should be able to list all transactions', async () => {
    const createTrasactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new Transaction',
        amount: 4000,
        type: 'credit',
      })
    const cookies = createTrasactionResponse.get('Set-Cookie')
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new Transaction',
        amount: 4000,
      }),
    ])
  })
})
