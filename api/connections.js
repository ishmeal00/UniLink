import { db } from "hatchable";
export const access = "user";
export const methods = ["GET","POST"];
export default async function(req,res){
  const u=req.user;
  if(req.method==="POST"){
    const id=req.body.user_id;
    const blocked=await db.query("SELECT 1 FROM user_blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1) LIMIT 1",[u.id,id]);
    if(blocked.rows.length) return res.status(403).json({error:"Blocked"});
    await db.query("INSERT INTO connections(sender_id,receiver_id,status) VALUES($1,$2,'pending') ON CONFLICT DO NOTHING",[u.id,id]);
    return res.json({ok:true});
  }
  const [incoming,sent,accepted]=await Promise.all([
    db.query("SELECT c.id,c.sender_id id,p.name,p.university,p.field,p.year,p.avatar FROM connections c JOIN profiles p ON p.user_id=c.sender_id WHERE c.receiver_id=$1 AND c.status='pending' ORDER BY c.created_at DESC",[u.id]),
    db.query("SELECT c.id,c.receiver_id id,p.name,p.university,p.field,p.year,p.avatar FROM connections c JOIN profiles p ON p.user_id=c.receiver_id WHERE c.sender_id=$1 AND c.status='pending' ORDER BY c.created_at DESC",[u.id]),
    db.query("SELECT c.id,CASE WHEN c.sender_id=$1 THEN c.receiver_id ELSE c.sender_id END id,p.name,p.university,p.field,p.year,p.avatar FROM connections c JOIN profiles p ON p.user_id=CASE WHEN c.sender_id=$1 THEN c.receiver_id ELSE c.sender_id END WHERE (c.sender_id=$1 OR c.receiver_id=$1) AND c.status='accepted' ORDER BY c.created_at DESC",[u.id])
  ]);
  res.json({incoming:incoming.rows,sent:sent.rows,connections:accepted.rows});
}