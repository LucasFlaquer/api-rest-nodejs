import fastify from 'fastify'
import { knex } from './database'
import crypto from 'node:crypto'

const app = fastify()

app.get('/hello', async (req, res) => {
  const transaction = await knex('transactions').select('*')
  // .insert({
  //   id: crypto.randomUUID(),
  //   title: 'Transação de teste',
  //   amount: 100,
  // })
  // .returning('*')

  return transaction
})

app.listen({ port: 3333 }).then(() => console.log('HTTP SERVER RUNNING'))
