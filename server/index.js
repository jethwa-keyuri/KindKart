import express from 'express'

const app=express()
const port=8000

app.use(express.json())//enables middleware that enables express to understand a json

app.get('/',(req,res)=>{
    res.send("Hello from express server")
})

app.listen(port,()=>{
    console.log(`server is running at http://localhost:${port}`);
    
})
