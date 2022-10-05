const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const auth =require('./auth')
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const nodemailer = require("nodemailer");
const express = require('express');
const app = express()

let log = 0;

// using this port
port=80


app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())




app.get('/', function (req, res) {
  res.sendFile('index.html');
})


app.post('/register', async (req,res) => {
    try {
        const student_detailss = new Register({
            username : req.body.username,
            email : req.body.email,
            password : req.body.password,
            cpassword : req.body.cpassword
        })

        const token = await student_detailss.generateAuthToken();

        res.cookie("sign_up",token);
        
        
        const registered = await student_detailss.save();
        res.redirect("/login.html")
        
       
    } catch (error) {
        res.send('<h1 style="text-align:center;margin-top:20%;font-family: sans-serif;">Email is already used before<br>please try again</h1>')        

        console.log(error)
    }
})


app.post('/login', async (req,res) => {
    try {
        if(log==0){
            const email = req.body.email;
            const pass = req.body.password;

            const useremail = await Register.findOne({email:email});

            const token = await useremail.generateAuthToken();

            if(await bcrypt.compare(pass,useremail.password)){
                res.redirect("/index.html")
                res.cookie("sign_in",token);
                log=1;
            }
            else{
                res.send('<h1 style="text-align:center;margin-top:20%;font-family: sans-serif;">password is not matching</h1>')        
            }
        }
        else{
            res.send('<h1 style="text-align:center;margin-top:20%;font-family: sans-serif;">please log out first</h1>') 
        }

    } catch (error) {
        res.send('<h1 style="text-align:center;margin-top:20%;font-family: sans-serif;">Email is not found please signup first</h1>')        
    }
})


app.get('/form',auth,(req,res)=>{
    if(log==1){
        res.redirect("/form.html")
    }
    else{
        res.send('<h1 style="text-align:center;margin-top:20%;font-family: sans-serif;">Please login first</h1>')        
    }
});


const publishablekey = "pk_test_51LlxXLSB8urzT3rAMD7NlM1yDtjXTQEGn1N40m8mGXY1uBPfdG3vg9bbQz4kYrX9PGHP2esiLWeYK3631TUEspXn00rwN6mJnC";
const secret_key = "sk_test_51LlxXLSB8urzT3rAGcRZT5oiEwqIlIKJNPI34QqyR9sLWqwMswuVDmKHPvhjHxk2Xg9XiJEl5S9cu8i0TMol5iYM00OHMUNRpt";
app.set('view engine', 'ejs');
const stripe = require('stripe')(secret_key);


app.post('/payment_page',async(req,res)=>{
    try {
        const email = req.body.email
        const useremail = await Register.findOne({email:email});
        
        const student_details = useremail.Register.insert({
            email: email,
            Firstname : req.body.FirstName,
            Middlename : req.body.MiddleName,
            Lastname :req.body.LastName,
            Birth : req.body.dob,
            Gender : req.body.gender,
            Phone:req.body.phone,
            Address:req.body.address,
            City:req.body.city,
            Pincode:req.body.pincode,
        })
    
        const registered = await student_details.save();

        res.render('payment',{ key:publishablekey})
    } catch (error) {
        console.log(error);
    }
    
})

app.post('/payment', async function(req, res){
    try {
        const mail = req.body.stripeEmail;

        const transporter = nodemailer.createTransport({
            service:"gmail",
            host: "smtp.gmsil.com",
            port: 465,
            secure: false, // true for 465, false for other ports
            auth: {
              user: "abhaykesarwani005@gmail.com", // generated ethereal user
              pass: "mebmfyxjujyumlhq" // generated ethereal password
            },
          });
    
          var mailOptions={
            from: "abhaykesarwani005@gmail.com", 
            to: mail, 
            subject: "Payment Completed ✔", 
            text: "Hello world?", 
            html: "<h1>Hello Learner</h1> <p>Thank you so much for buying our course form <br> Educal Organisation !!!</p><p><br><br> Now we will be updating you about our : <br><br>Courses <br><br>Articles<br><br>Events<br><br><br>Please stay connected with us.<br><br><br>Thank You<br>From Educal</p>", 
          };
    
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              res.redirect("/article.html")
            }
          });

        res.redirect("/thanks.html")
        
    } catch (error) {
        console.log(error);
    }
})

app.get('/logout',auth,async(req,res)=>{
    try {
        if(log==1){
            res.redirect("/index.html")
            log=0;
        }
        else{
            res.send('<h1 style="text-align:center;margin-top:20%;font-family: sans-serif;">Please login first</h1>')        
        }    

    } catch (error) {
    }
});


app.post('/suscribe',(req,res)=>{
    const useremail = req.body.email;

    const transporter = nodemailer.createTransport({
        service:"gmail",
        host: "smtp.gmsil.com",
        port: 465,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "abhaykesarwani005@gmail.com", // generated ethereal user
          pass: "mebmfyxjujyumlhq" // generated ethereal password
        },
      });

      var mailOptions={
        from: "abhaykesarwani005@gmail.com", 
        to: useremail, 
        subject: "Educal Articles ✔", 
        text: "Hello world?", 
        html: "<h1>Hello Learner</h1> <p>Thanks for suscribing us ,<br><br> Now we will be updating you about our : <br><br>Courses <br><br>Articles<br><br>Events<br><br><br>Please stay connected with us.<br><br><br>Thank You<br>From Educal</p>", 
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          res.redirect("/article.html")
        }
      });
  
})



app.listen(port,(req,rep)=>{
    console.log(`app lisiting to localhost: ${port}`)
})




// =======================================================================================================



const Register = require("./database");

// connecting to database
const uri_offline = "mongodb://localhost:27017/course_registration";

const uri_online = 'mongodb+srv://abhay:abhay@cluster0.guvufta.mongodb.net/student_details?retryWrites=true&w=majority';


mongoose.connect(uri_online ,{
    useNewUrlParser : true ,
    // useCreateIndex : true ,
    // useUnifiedTopology : true ,
    // useFindAndModify : false

})
.then(()=>{
    console.log("connection to database is successfull");
})
.catch((error)=>{
    console.log("conection unsuccessfull");
    console.log(error)
})


