import { db } from "hatchable";
export const access = "user";
export const methods = ["GET","POST"];
export default async function(req,res){
  const u=req.user, other=req.query.user_id||req.body?.user_id;
  if(!other) return res.status(400).json({error:"user_id required"});
  const allowed=await db.query("SELECT 1 FROM connections WHERE status='accepted' AND ((sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)) LIMIT 1",[u.id,other]);
  if(!allowed.rows.length) return res.status(403).json({error:"Not connected"});
  if(req.method==="POST"){
    const content=(req.body.content||"").trim();
    if(!content) return res.status(400).json({error:"Empty message"});
    const r=await db.query("INSERT INTO messages(sender_id,receiver_id,content) VALUES($1,$2,$3) RETURNING id,sender_id,receiver_id,content,created_at",[u.id,other,content]);
    return res.json(r.rows[0]);
  }
  const r=await db.query("SELECT id,sender_id,receiver_id,content,created_at FROM messages WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1) ORDER BY created_at ASC LIMIT 100",[u.id,other]);
  res.json(r.rows);
}