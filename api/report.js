import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const b=req.body||{};
  if(!b.user_id||!b.reason) return res.status(400).json({error:"Missing fields"});
  await db.query("INSERT INTO user_reports(reporter_id,reported_id,reason) VALUES($1,$2,$3)",[req.user.id,b.user_id,b.reason]);
  res.json({ok:true});
}