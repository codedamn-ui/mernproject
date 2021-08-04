require('dotenv').config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
require("../db/conn");
const bcrypt = require("bcryptjs");
const Employee = require('../models/userData');
const port = process.env.PORT || 8000;
const app =  express();

app.use(express.json());
app.use(express.urlencoded({extended : false}));

const static_path = path.join(__dirname,'../templates/views');
const partials_path = path.join(__dirname,'../templates/partials')
// console.log(static_path);
// app.use(express.static(static_path))

// const securePassword = async (password) => {
//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash);

//     const passwordMatch = await bcrypt.compare(password,passwordHash);
//     console.log(passwordMatch);
// }

// securePassword("Sayak123")


app.set("view engine", "hbs");
app.set("views",static_path);
hbs.registerPartials(partials_path);


app.get('/', (req,res) => {
    res.render("index")
})

app.get('/registration', (req,res) => {
    res.render("registration")
})

app.get('/login', (req,res) => {
    res.render("login")
})

app.post('/registration', async (req,res) => {
   try{
       const password = req.body.password;
       const cpassword = req.body.confirmpassword;
       if(password === cpassword){       
        const userData = new Employee({
            firstname : req.body.firstname,
            lastname : req.body.lastname,
            gender : req.body.gender,
            email : req.body.email,
            phone : req.body.phone,
            age : req.body.age,
            password : password,
            confirmpassword : cpassword
        })


        const token = await userData.generateAuthToken();


        const registered = await userData.save();

        res.status(201);
        res.send("Your account has been created successfully!!!")
       }else{
        res.send("Passwords are not matching!")
       }

   }catch(e){
    res.status(500);
    res.send(`Could not create account --> ${e}`)
   }
})

app.post('/login', async (req,res) => {
    try{
        const logEmail = req.body.email;
        const logPass = req.body.password;

      const userEmail = await Employee.findOne({email:logEmail});

      const isMatch = await bcrypt.compare(logPass,userEmail.password);
        
      const token = await userEmail.generateAuthToken();
      console.log(token);

      if(isMatch){
        res.render("index",{
            username : userEmail.firstname
        });

      }else{
          res.send("Invalid Password!")
      }
    }catch(e){
        res.status(400);
        res.send("Invalid email address!")
    }   
})


// const jwt = require("jsonwebtoken");

// const createToken = async () => {
//   const token = await jwt.sign({_id:"61065ef7a9f5871ca45e66b7"},"mynameisvinodbahadurthapayoutuber",{
//       expiresIn : "2 minutes"
//   })
//   console.log(token);

//   const userVer = await jwt.verify(token,"mynameisvinodbahadurthapayoutuber")
//   console.log(userVer)
// }

// createToken();


app.listen(port,() => {
    console.log(`Listening to port ${port}`)
});
