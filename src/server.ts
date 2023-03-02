import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/hello', async (req, res) => {
  const test = await knex('sqlite_schema').select('*')

  return test
})

app.listen({ port: 3333 }).then(() => console.log('HTTP SERVER RUNNING'))
