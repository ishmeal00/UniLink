import { db } from "hatchable";
export const access = "user";
export const methods = ["GET"];
export default async function(req,res){
  const u=req.user;
  const q=(req.query.q||"").trim(), university=req.query.university||"", field=req.query.field||"", year=req.query.year||"", goal=req.query.goal||"";
  const {rows}=await db.query(`
    SELECT p.user_id id,p.name,p.university,p.field,p.year,p.bio,p.avatar,
      COALESCE((SELECT json_agg(s.name ORDER BY s.name) FROM user_skills us JOIN skills s ON s.id=us.skill_id WHERE us.user_id=p.user_id),'[]') skills,
      COALESCE((SELECT json_agg(i.name ORDER BY i.name) FROM user_interests ui JOIN interests i ON i.id=ui.interest_id WHERE ui.user_id=p.user_id),'[]') interests,
      COALESCE((SELECT json_agg(g.name ORDER BY g.name) FROM user_goals ug JOIN goals g ON g.id=ug.goal_id WHERE ug.user_id=p.user_id),'[]') goals
    FROM profiles p
    WHERE p.user_id<>$1
      AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE b.blocker_id=$1 AND b.blocked_id=p.user_id)
      AND ($2='' OR p.university=$2) AND ($3='' OR p.field=$3) AND ($4='' OR p.year=$4)
      AND ($5='' OR EXISTS (SELECT 1 FROM user_goals ug JOIN goals g ON g.id=ug.goal_id WHERE ug.user_id=p.user_id AND g.name=$5))
      AND ($6='' OR lower(p.name) LIKE lower('%'||$6||'%') OR lower(p.field) LIKE lower('%'||$6||'%'))
    ORDER BY p.created_at DESC LIMIT 50
  `,[u.id,university,field,year,goal,q]);
  const me=await db.query(`SELECT p.university,p.field,
    COALESCE((SELECT array_agg(s.name) FROM user_skills us JOIN skills s ON s.id=us.skill_id WHERE us.user_id=p.user_id),'{}') skills,
    COALESCE((SELECT array_agg(i.name) FROM user_interests ui JOIN interests i ON i.id=ui.interest_id WHERE ui.user_id=p.user_id),'{}') interests,
    COALESCE((SELECT array_agg(g.name) FROM user_goals ug JOIN goals g ON g.id=ug.goal_id WHERE ug.user_id=p.user_id),'{}') goals
    FROM profiles p WHERE p.user_id=$1`,[u.id]);
  const m=me.rows[0]||{skills:[],interests:[],goals:[]};
  const overlap=(a,b)=>a.filter(v=>b.includes(v)).length;
  const score=x=>Math.round(
    (m.university&&x.university===m.university?20:0)+
    (m.field&&x.field===m.field?20:0)+
    (Math.min(1,overlap(m.skills||[],x.skills||[])/Math.max((m.skills||[]).length,1))*25)+
    (Math.min(1,overlap(m.interests||[],x.interests||[])/Math.max((m.interests||[]).length,1))*15)+
    (Math.min(1,overlap(m.goals||[],x.goals||[])/Math.max((m.goals||[]).length,1))*20)
  );
  res.json(rows.map(x=>({...x,match:score(x)})));
}