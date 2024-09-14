import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const app=express();
const server= createServer(app);
const PORT=8080;
const __dirname = dirname(fileURLToPath(import.meta.url));

// console.log(__dirname);


app.get("/",(req,res)=>
{
    res.sendFile(join(__dirname,"login.html"));
})
server.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`)
})
