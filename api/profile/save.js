import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const b=req.body||{}, u=req.user;
  const skills=Array.isArray(b.skills)?b.skills:[], interests=Array.isArray(b.interests)?b.interests:[], goals=Array.isArray(b.goals)?b.goals:[];
  await db.query("INSERT INTO profiles (user_id,name,university,field,year,bio,avatar) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (user_id) DO UPDATE SET name=$2,university=$3,field=$4,year=$5,bio=$6,avatar=$7",[u.id,b.name||u.name||"Student",b.university||"",b.field||"",b.year||"",b.bio||"",b.avatar||""]);
  await db.query("DELETE FROM user_skills WHERE user_id=$1",[u.id]);
  for(const id of skills) await db.query("INSERT INTO user_skills(user_id,skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[u.id,id]);
  await db.query("DELETE FROM user_interests WHERE user_id=$1",[u.id]);
  for(const id of interests) await db.query("INSERT INTO user_interests(user_id,interest_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[u.id,id]);
  await db.query("DELETE FROM user_goals WHERE user_id=$1",[u.id]);
  for(const id of goals) await db.query("INSERT INTO user_goals(user_id,goal_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[u.id,id]);
  res.json({ok:true});
}