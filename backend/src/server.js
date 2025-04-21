// src/server.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fetchSearchPage, parseProducts } from './scraper.js'

const app = express()
//Utilizando variaveis de ambiente para uma melhor segurança no código
const PORT = process.env.PORT
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN

//Habilitanto o cors para poder puxar os dados no front-end 
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
)

app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.keyword
  if (!keyword) {
    return res.status(400).json({ error: 'keyword é obrigatório' })
  }

  try {
    const html = await fetchSearchPage(keyword)
    const products = parseProducts(html)
    res.json({ products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'falha no scraping' })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
