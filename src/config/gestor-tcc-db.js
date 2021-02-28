const mongoose = require('mongoose')

//==============Produção=================================
//descomentar quando estiver em produção
mongoose.connect(process.env.DATABASE_STRING, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true, 
        useFindAndModify: false   
    })
const db = mongoose.connection
db.on('error', (err)=> console.log(err))
db.once('open', () => console.log('Database Connected'))

//============Desenvolvimento========================
//Descomentar quando estiver trabalhando local
// mongoose.connect(process.env.DATABASE_STRING_LOCAL, 
//     { 
//         useNewUrlParser: true, 
//         useUnifiedTopology: true,
//         useCreateIndex: true, 
//         useFindAndModify: false   
//     })
// const db = mongoose.connection
// db.on('error', (err)=> console.log(err))
// db.once('open', () => console.log('Database Connected'))

