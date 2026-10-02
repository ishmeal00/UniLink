import { db } from "hatchable";
export const access = "user";
export const methods = ["GET"];
export default async function(req,res){
  const {rows}=await db.query(`SELECT p.user_id id,p.name,p.university,p.field,p.year,p.bio,p.avatar,
    COALESCE((SELECT json_agg(s.name ORDER BY s.name) FROM user_skills us JOIN skills s ON s.id=us.skill_id WHERE us.user_id=p.user_id),'[]') skills,
    COALESCE((SELECT json_agg(i.name ORDER BY i.name) FROM user_interests ui JOIN interests i ON i.id=ui.interest_id WHERE ui.user_id=p.user_id),'[]') interests,
    COALESCE((SELECT json_agg(g.name ORDER BY g.name) FROM user_goals ug JOIN goals g ON g.id=ug.goal_id WHERE ug.user_id=p.user_id),'[]') goals
    FROM profiles p WHERE p.user_id=$1`,[req.params.id]);
  if(!rows[0]) return res.status(404).json({error:"Not found"});
  const c=await db.query("SELECT status,sender_id,receiver_id FROM connections WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1) ORDER BY created_at DESC LIMIT 1",[req.user.id,req.params.id]);
  res.json({profile:rows[0],connection:c.rows[0]||null});
}