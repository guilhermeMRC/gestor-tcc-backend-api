const mongoose = require('mongoose')

//descomentar quando estiver em produção
mongoose.connect(process.env.DATABASE_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (err)=> console.log(err))
db.once('open', () => console.log('Database Connected'))

//Descomentar quando estiver trabalhando local
// mongoose.connect(process.env.DATABASE_STRING_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true })
// const db = mongoose.connection
// db.on('error', (err)=> console.log(err))
// db.once('open', () => console.log('Database Connected'))

