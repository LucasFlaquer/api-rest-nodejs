import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId: string | undefined = request.cookies.sessionId

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()
      return { transactions }
    },
  )
  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req) => {
    const sessionId: string | undefined = req.cookies.sessionId
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionParamsSchema.parse(req.params)
    const transaction = await knex('transactions')
      .where({ session_id: sessionId, id })
      .first()

    return { transaction }
  })

  app.get('/summary', { preHandler: [checkSessionIdExists] }, async (req) => {
    const sessionId: string | undefined = req.cookies.sessionId
    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'ammount' })
      .first()

    return { summary }
  })

  app.post('/', async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const body = createTransactionBodySchema.parse(req.body)
    const { amount, title, type } = body
    let sessionId = req.cookies.sessionId
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }
    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
}
