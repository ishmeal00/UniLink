import { db } from "hatchable";
export const access="user";
export const methods=["GET","POST"];
export default async function(req,res){
 const u=req.user;
 if(req.method==="GET"){
  const postId=req.query.post_id;
  if(postId){
   const p=await db.query(`SELECT p.id,p.author_id,p.community_id,p.title,p.content,p.post_type,p.image_url,p.created_at,pr.name author_name,pr.university,pr.field,pr.year,c.name community_name,COALESCE((SELECT sum(CASE WHEN vote_type='up' THEN 1 ELSE 0 END)-sum(CASE WHEN vote_type='down' THEN 1 ELSE 0 END) FROM votes v WHERE v.post_id=p.id),0) score,EXISTS(SELECT 1 FROM votes v WHERE v.post_id=p.id AND v.user_id=$1 AND v.vote_type='up') user_up,EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id=p.id AND s.user_id=$1) saved FROM posts p JOIN profiles pr ON pr.user_id=p.author_id JOIN communities c ON c.id=p.community_id WHERE p.id=$2`,[u.id,postId]);
   const comments=await db.query(`SELECT cm.id,cm.post_id,cm.author_id,cm.parent_comment_id,cm.content,cm.created_at,pr.name author_name,COALESCE((SELECT sum(CASE WHEN vote_type='up' THEN 1 ELSE 0 END)-sum(CASE WHEN vote_type='down' THEN 1 ELSE 0 END) FROM comment_votes cv WHERE cv.comment_id=cm.id),0) score FROM comments cm JOIN profiles pr ON pr.user_id=cm.author_id WHERE cm.post_id=$1 ORDER BY cm.created_at ASC`,[postId]);
   return res.json({post:p.rows[0],comments:comments.rows});
  }
  const sort=req.query.sort||"hot", q=(req.query.q||"").trim();
  const order=sort==="new"?"p.created_at DESC":sort==="top"?"score DESC,p.created_at DESC":"score DESC,p.created_at DESC";
  const r=await db.query(`SELECT p.id,p.author_id,p.community_id,p.title,p.content,p.post_type,p.image_url,p.created_at,pr.name author_name,pr.university,pr.field,pr.year,c.name community_name,COALESCE((SELECT count(*) FROM comments cm WHERE cm.post_id=p.id),0) comment_count,COALESCE((SELECT sum(CASE WHEN vote_type='up' THEN 1 ELSE 0 END)-sum(CASE WHEN vote_type='down' THEN 1 ELSE 0 END) FROM votes v WHERE v.post_id=p.id),0) score,EXISTS(SELECT 1 FROM votes v WHERE v.post_id=p.id AND v.user_id=$1 AND v.vote_type='up') user_up,EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id=p.id AND s.user_id=$1) saved FROM posts p JOIN profiles pr ON pr.user_id=p.author_id JOIN communities c ON c.id=p.community_id WHERE ($2='' OR p.title ILIKE '%'||$2||'%' OR p.content ILIKE '%'||$2||'%' OR c.name ILIKE '%'||$2||'%' OR pr.name ILIKE '%'||$2||'%') ORDER BY ${order} LIMIT 50`,[u.id,q]);
  return res.json(r.rows);
 }
 const b=req.body||{}, action=b.action;
 if(action==="create"){
  const title=(b.title||"").trim(),content=(b.content||"").trim();
  if(!title) return res.status(400).json({error:"Title required"});
  const r=await db.query("INSERT INTO posts(author_id,community_id,title,content,post_type,image_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",[u.id,b.community_id,title,content,b.post_type||"discussion",b.image_url||null]); return res.json(r.rows[0]);
 }
 if(action==="vote"){
  const existing=await db.query("SELECT id,vote_type FROM votes WHERE user_id=$1 AND post_id=$2",[u.id,b.post_id]);
  if(existing.rows[0]&&existing.rows[0].vote_type===b.vote_type) await db.query("DELETE FROM votes WHERE id=$1",[existing.rows[0].id]);
  else if(existing.rows[0]) await db.query("UPDATE votes SET vote_type=$1 WHERE id=$2",[b.vote_type,existing.rows[0].id]);
  else await db.query("INSERT INTO votes(user_id,post_id,vote_type) VALUES($1,$2,$3)",[u.id,b.post_id,b.vote_type]);
  const p=await db.query("SELECT author_id FROM posts WHERE id=$1",[b.post_id]);
  if(p.rows[0]&&p.rows[0].author_id!==u.id&&b.vote_type==="up") await db.query("INSERT INTO notifications(user_id,type,actor_id,post_id) VALUES($1,'post_upvote',$2,$3)",[p.rows[0].author_id,u.id,b.post_id]);
  return res.json({ok:true});
 }
 if(action==="comment"){
  const content=(b.content||"").trim(); if(!content) return res.status(400).json({error:"Comment required"});
  const r=await db.query("INSERT INTO comments(post_id,author_id,parent_comment_id,content) VALUES($1,$2,$3,$4) RETURNING id,post_id,author_id,parent_comment_id,content,created_at",[b.post_id,u.id,b.parent_comment_id||null,content]);
  const p=await db.query("SELECT author_id FROM posts WHERE id=$1",[b.post_id]);
  if(p.rows[0]&&p.rows[0].author_id!==u.id) await db.query("INSERT INTO notifications(user_id,type,actor_id,post_id,comment_id) VALUES($1,'comment',$2,$3,$4)",[p.rows[0].author_id,u.id,b.post_id,r.rows[0].id]);
  return res.json(r.rows[0]);
 }
 if(action==="save"){
  const ex=await db.query("SELECT 1 FROM saved_posts WHERE user_id=$1 AND post_id=$2",[u.id,b.post_id]);
  if(ex.rows.length) await db.query("DELETE FROM saved_posts WHERE user_id=$1 AND post_id=$2",[u.id,b.post_id]); else await db.query("INSERT INTO saved_posts(user_id,post_id) VALUES($1,$2)",[u.id,b.post_id]);
  return res.json({ok:true});
 }
 if(action==="delete"){const r=await db.query("DELETE FROM posts WHERE id=$1 AND author_id=$2",[b.post_id,u.id]);return res.json({ok:r.rowCount>0});}
 return res.status(400).json({error:"Unknown action"});
}