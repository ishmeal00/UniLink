import { db } from "hatchable";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const u=req.user;
 if(req.method==="GET"){
  const slug=req.query.slug;
  if(slug){
   const c=await db.query(`SELECT c.id,c.name,c.slug,c.description,c.category,c.created_at,COUNT(DISTINCT cm.user_id)::int member_count,EXISTS(SELECT 1 FROM community_members x WHERE x.community_id=c.id AND x.user_id=$1) joined FROM communities c LEFT JOIN community_members cm ON cm.community_id=c.id WHERE c.slug=$2 GROUP BY c.id`,[u.id,slug]);
   if(!c.rows[0]) return res.status(404).json({error:"Community not found"});
   const posts=await db.query(`SELECT p.id,p.author_id,p.title,p.content,p.post_type,p.created_at,pr.name author_name,c.name community_name,COALESCE((SELECT count(*) FROM comments cm WHERE cm.post_id=p.id),0) comment_count,COALESCE((SELECT sum(CASE WHEN vote_type='up' THEN 1 ELSE 0 END)-sum(CASE WHEN vote_type='down' THEN 1 ELSE 0 END) FROM votes v WHERE v.post_id=p.id),0) score FROM posts p JOIN profiles pr ON pr.user_id=p.author_id JOIN communities c ON c.id=p.community_id WHERE c.id=$1 ORDER BY p.created_at DESC LIMIT 50`,[c.rows[0].id]);
   return res.json({community:c.rows[0],posts:posts.rows});
  }
  const r=await db.query(`SELECT c.id,c.name,c.slug,c.description,c.category,c.created_at,COUNT(DISTINCT cm.user_id)::int member_count,EXISTS(SELECT 1 FROM community_members x WHERE x.community_id=c.id AND x.user_id=$1) joined FROM communities c LEFT JOIN community_members cm ON cm.community_id=c.id GROUP BY c.id ORDER BY c.category,c.name`,[u.id]); return res.json(r.rows);
 }
 if(req.body?.action==="join"){const ex=await db.query("SELECT 1 FROM community_members WHERE community_id=$1 AND user_id=$2",[req.body.community_id,u.id]);if(ex.rows.length) await db.query("DELETE FROM community_members WHERE community_id=$1 AND user_id=$2",[req.body.community_id,u.id]);else await db.query("INSERT INTO community_members(community_id,user_id) VALUES($1,$2)",[req.body.community_id,u.id]);return res.json({ok:true});}
 return res.status(400).json({error:"Unknown action"});
}