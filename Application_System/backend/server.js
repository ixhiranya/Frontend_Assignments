const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Server running...!!");
});

app.listen(5000,()=>{
    console.log("Server started on port 5000");
});

const {connectDB}=require("./db");
connectDB();

const {sql}=require("./db");
app.get("/forms",async(req,res)=>{
    const result=await sql.query("SELECT * FROM application_forms");
    res.json(result.recordset);
});