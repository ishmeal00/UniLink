import { db, auth } from "hatchable";
export const access = "user";
export const methods = ["GET"];
export default async function(req,res){
  const u = req.user;
  const {rows} = await db.query("SELECT user_id,name,university,field,year,bio,avatar FROM profiles WHERE user_id=$1",[u.id]);
  res.json({user:{id:u.id,email:u.email,name:u.name,image:u.image},profile:rows[0]||null});
}