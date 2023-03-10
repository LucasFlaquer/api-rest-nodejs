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
  it('should be able to get a specific transaction', async () => {
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

    const transactionId = listTransactionsResponse.body.transactions[0].id
    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'new Transaction',
        amount: 4000,
      }),
    )
  })
  it('should be able to get the summary', async () => {
    const createTrasactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new Transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createTrasactionResponse.get('Set-Cookie')
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'new Transaction',
        amount: 2000,
        type: 'debit',
      })
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({ ammount: 3000 })
  })
})
