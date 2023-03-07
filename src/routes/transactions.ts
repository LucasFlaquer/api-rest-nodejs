import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select()
    return { transactions }
  })
  app.get('/:id', async (req) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionParamsSchema.parse(req.params)
    const transaction = await knex('transactions').where('id', id).first()

    return { transaction }
  })
  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const body = createTransactionBodySchema.parse(req.body)
    const { amount, title, type } = body

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })
    return res.status(201).send()
  })
}
