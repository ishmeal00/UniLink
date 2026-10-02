import { db } from "hatchable";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const u=req.user;
 if(req.method==="GET"){const r=await db.query("SELECT following_id FROM follows WHERE follower_id=$1",[u.id]);return res.json({following:r.rows.map(x=>x.following_id)});}
 const id=req.body?.user_id;if(!id||id===u.id)return res.status(400).json({error:"Invalid user"});
 const ex=await db.query("SELECT 1 FROM follows WHERE follower_id=$1 AND following_id=$2",[u.id,id]);
 if(ex.rows.length) await db.query("DELETE FROM follows WHERE follower_id=$1 AND following_id=$2",[u.id,id]);
 else {await db.query("INSERT INTO follows(follower_id,following_id) VALUES($1,$2)",[u.id,id]);await db.query("INSERT INTO notifications(user_id,type,actor_id) VALUES($1,'follow',$2)",[id,u.id]);}
 res.json({ok:true,following:!ex.rows.length});
}