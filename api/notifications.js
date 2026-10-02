import { db } from "hatchable";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const u=req.user;
 if(req.method==="POST"){await db.query("UPDATE notifications SET read=true WHERE user_id=$1",[u.id]);return res.json({ok:true});}
 const r=await db.query(`SELECT n.id,n.type,n.read,n.created_at,n.post_id,n.comment_id,COALESCE(p.name,'Student') actor_name FROM notifications n LEFT JOIN profiles p ON p.user_id=n.actor_id WHERE n.user_id=$1 ORDER BY n.created_at DESC LIMIT 30`,[u.id]);res.json(r.rows);
}