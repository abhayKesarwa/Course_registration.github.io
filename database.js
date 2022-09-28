const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

// const student_schema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
//   cpassword: String,
//   date: Date
// });
const student_schema = new mongoose.Schema({
    username: {
        type :String,
        required :true
    },
    email: {
        type :String,
        required :true,
        unique:true,
    },
    password: {
          type :String,
          required :true,
     },
    cpassword: {
          type :String,
          required :true
     },
    tokens: [{
        token: {
            type :String,
          required :true
        },
    }],
    Firstname: String,
    Middlename: String,
    Lastname: String,
    Birth:Date,
    Gender:String,
    Phone:Number,
    Address:String,
    City:String,
    Pincode:Number,
  });

// generating tokens
student_schema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()}, "thisiswherewearegeneratingtokensforeachuser");
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part"+error);
        console.log("the error part"+error);

    }
}


// converting password into hash
student_schema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.cpassword = await bcrypt.hash(this.password,10);
    }
    next();
})

const Register = new mongoose.model('user',student_schema);
  
module.exports = Register;

