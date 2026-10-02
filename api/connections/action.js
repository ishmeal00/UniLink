import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const u=req.user,b=req.body||{};
  if(b.action==="accept"||b.action==="reject"){
    const status=b.action==="accept"?"accepted":"rejected";
    await db.query("UPDATE connections SET status=$1 WHERE id=$2 AND receiver_id=$3 AND status='pending'",[status,b.id,u.id]);
  }
  res.json({ok:true});
}