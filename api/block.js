import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const id=req.body?.user_id;
  if(!id) return res.status(400).json({error:"Missing user_id"});
  await db.query("INSERT INTO user_blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[req.user.id,id]);
  res.json({ok:true});
}