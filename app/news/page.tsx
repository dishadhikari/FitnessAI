"use client";
import { useEffect,useState } from "react";

export default function NewsPage() {
 const [articles,setArticles]=useState([]);
 useEffect(()=>{
   fetch("http://localhost:5000/news")
    .then(res=>res.json())
    .then(data=>setArticles(data));
 },[]);

 return(
  <div>
   <h1>Fitness News</h1>
   {articles.map((article:any)=>(
    <div
      key={article.id}
      style={{
        border:"1px solid gray",
        padding:"20px",
        marginBottom:"20px"
      }}
    >
      <h2>{article.title}</h2>
      <img
        src={article.image_url}
        width={300}
      />
      <p>
        {article.summary}
      </p>
      <h3>
        5 Minute Summary
      </h3>
      <ul>
        {article.points?.map(
          (point:string,index:number)=>(
            <li key={index}>{point}</li>
          )
        )}
      </ul>
      <a
        href={article.url}
        target="_blank"
      >
        Read Original Article
      </a>
    </div>
   ))}
  </div>
 );
}