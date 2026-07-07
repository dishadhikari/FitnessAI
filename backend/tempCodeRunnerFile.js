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