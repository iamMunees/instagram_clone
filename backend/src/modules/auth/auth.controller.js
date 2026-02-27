import * as authService from "./auth.services.js"

export const register=async(req,res)=>{
  try{
   const user=await authService.registerUser(req.body)
   res.status(201).json({message:"user registered",user})
  }catch(err){
    if(err.message==="EMAIL_EXITS"){
     return res.status(400).json({message:"Email already registered"});
    }
    return res.status(500).json({message:"Internal Server Error"})
  }
};

export const login=async(req,res)=>{
  try{
   const token=await authService.loginUser(req.body)
   res.json(token)
  }catch(err){
  res.status(401).json({error:err.message})
  }
};
