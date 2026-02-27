import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool  from "../../config/db.js";

export const registerUser =async({name,username,email,password})=>{
   const emailCheck=await pool.query("select id from users where email=$1",[email]);
   if(emailCheck.rows.length>0){
    throw new Error("EMAIL_EXITS");
   }
   const hashedPassword=await bcrypt.hash(password,10)

   const result=await pool.query(
    `INSERT INTO users (name, username, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, username, email`,
    [name, username, email, hashedPassword]);
    return result.rows[0];
}

export const loginUser=async({email,password})=>{
    const user=await pool.query(
      "SELECT* FROM users WHERE email=$1",
      [email]
    )
    if(!user.rows.length) throw new Error("User not found")

      const valid=await bcrypt.compare(password,user.rows[0].password);
      if(!valid) throw new Error("Invalid password")
        
        const token=jwt.sign(
          {id:user.rows[0].id},
          process.env.JWT_SECRET,
          {expiresIn:process.env.JWT_EXPIRES || "7d"}
        );
        return {
          token,
          user: {
            id: user.rows[0].id,
            name: user.rows[0].name,
            username: user.rows[0].username,
            email: user.rows[0].email,
          },
        };
};
