export function errorHandler(err,req,res,next){console.error(err);res.status(400).json({message:err?.issues?.[0]?.message||err.message||"Request failed"})}
