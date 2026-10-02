import { db } from "hatchable";
export const access="user"; export const methods=["GET"];
export default async function(req,res){
 const id=req.query.user_id||req.user.id;
 const posts=await db.query("SELECT p.id,p.title,p.content,p.post_type,p.created_at,c.name community_name FROM posts p JOIN communities c ON c.id=p.community_id WHERE p.author_id=$1 ORDER BY p.created_at DESC LIMIT 10",[id]);
 const comments=await db.query("SELECT cm.id,cm.content,cm.created_at,p.id post_id,p.title FROM comments cm JOIN posts p ON p.id=cm.post_id WHERE cm.author_id=$1 ORDER BY cm.created_at DESC LIMIT 10",[id]);
 const communities=await db.query("SELECT c.id,c.name,c.slug FROM community_members m JOIN communities c ON c.id=m.community_id WHERE m.user_id=$1 ORDER BY c.name",[id]);
 res.json({posts:posts.rows,comments:comments.rows,communities:communities.rows});
}