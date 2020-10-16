const mongoose = require('mongoose')

//Descomentar essas linhas quando estiver trabalhando com banco na nuvem 
// mongoose.connect(process.env.DATABASE_STRING, 
//     { 
//         useNewUrlParser: true, 
//         useUnifiedTopology: true,
//         useCreateIndex: true, 
//         useFindAndModify: false  
//     })
// const db = mongoose.connection
// db.on('error', (err)=> console.log(err))
// db.once('open', () => console.log('Database Connected'))

//quando mexer localmente descomente essas linhas
mongoose.connect(process.env.DATABASE_STRING_LOCAL, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useCreateIndex: true, 
        useFindAndModify: false 
    })    
const db = mongoose.connection
db.on('error', (err)=> console.log(err))
db.once('open', () => console.log('Database Connected'))

