import { db } from "hatchable";
export const access="user"; export const methods=["GET"];
export default async function(req,res){
 const q=(req.query.q||"").trim();if(!q)return res.json({people:[],communities:[],posts:[]});const like="%"+q+"%";
 const people=await db.query("SELECT p.user_id id,p.name,p.university,p.field,p.year FROM profiles p WHERE p.name ILIKE $1 OR p.university ILIKE $1 OR p.field ILIKE $1 LIMIT 12",[like]);
 const communities=await db.query("SELECT id,name,slug,description,category FROM communities WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 12",[like]);
 const posts=await db.query("SELECT p.id,p.title,p.content,c.name community_name,pr.name author_name,p.created_at FROM posts p JOIN communities c ON c.id=p.community_id JOIN profiles pr ON pr.user_id=p.author_id WHERE p.title ILIKE $1 OR p.content ILIKE $1 OR c.name ILIKE $1 LIMIT 20",[like]);
 res.json({people:people.rows,communities:communities.rows,posts:posts.rows});
}