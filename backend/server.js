require("dotenv").config({ path: __dirname + "/.env" });
const express=require("express");
const cors=require("cors");
const authroutes=require("./auth");
const buildprompt=require("./prompt");
const axios=require("axios");
const { asyncWrapProviders } = require("async_hooks");
const pool=require("./db");
const auth=require("./middleware");

const app=express();

app.use(cors());
app.use(express.json());

app.use("/",authroutes);

app.get("/",(req,res)=>{
    res.json({message:"Backend is working fine"});
})

app.post("/generateplan",async(req,res)=>{
    try{
        console.log("BODY:", req.body);
    const answers=req.body; 

    const prompt=buildprompt(answers);
    const response=await axios.post("https://api.groq.com/openai/v1/chat/completions",{
        model:"llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
    })
    console.log("AI RESPONSE:", response.data);
    const text=response.data.choices[0].message.content;

    const start=text.indexOf("{");
    const end=text.lastIndexOf("}");
    const json=JSON.parse(text.slice(start,end+1));
    res.json(json);}
    catch (err) {
        console.log("ERROR STATUS:", err.response?.status);
        console.log("ERROR DATA:", err.response?.data);
        res.status(500).json(err.response?.data || { error: "failed" });
      }
})

app.post("/saveplan",auth,async(req,res)=>{
    const {plan}=req.body;
    const userid=req.user.id;
    const result=await pool.query(`insert into workout(userid,goal,level,plan) values ($1,$2,$3,$4) returning *`,
    [userid,plan.goal,plan.level,plan]);
    res.json(result.rows[0]);
});

app.get("/getplan/:id",async(req,res)=>{
    const {id}=req.params;
    const result=await pool.query("select*from workout where id=$1",[id]);
    const row=result.rows[0];
    res.json({...row,plan:row.plan});
});

app.get("/news",async(req,res)=>{
  try{
  const result=await pool.query(`select*from news order by published_at desc limit 1`);
  res.json(result.rows);
  }
  catch(err){
    console.error("NEWS ROUTE ERROR:", err);
    res.status(500).json({ error: "failed to fetch news" });
  }
  }); 

app.get("/myworkouts",auth,async (req,res)=>
{
  try
  {
    const userid=req.user.id;
    const result=await pool.query(`select*from workout where userid=$1 order by created_at desc`,[userid]);
    res.status(200).json(result.rows);
  }
  catch(err)
  {
    console.error("MYWORKOUT ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
})

process.on("exit", (code) => {
  console.log("Node exited with code:", code);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

app.listen(5000,()=>{
    console.log("Server is running on port 5000 successfully");
})

console.log("Reached end of file");