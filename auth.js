const jwt = require('jsonwebtoken');
const Register = require("./database");



const auth = async (req , res , next)=>{
    try {  

        // geting cookie  
        const token = req.cookies.sign_in;
        // verifing it
        const verifyUser = jwt.verify(token,"thisiswherewearegeneratingtokensforeachuser")
        // matching it with the database
        const user = Register.findOne({_id:verifyUser._id})
        // sending it back to /form
        next();

        req.token = token;
        req.user = user;
        
    } catch (error) {
        res.send('<h1 style="text-align:center;margin-top:20%;font-family: sans-serif;">Please login first</h1>')        
    }
 };

module.exports = auth;