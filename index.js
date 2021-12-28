if(process.env.NODE_ENV !== 'production'){
   require('dotenv').config()
}

// Used express to get the file to display
const express = require('express')
const bcrypt = require('bcryptjs')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const LocalStrategy = require('passport-local').Strategy
const nodemailer = require('nodemailer')
const fs = require('fs')

// mongodb library
const mongoose = require('mongoose')

const dbURL = 'mongodb+srv://qsUser:hum2B2XhbxAg98b@cluster0.rmx4o.mongodb.net/qualityStudios-db?retryWrites=true&w=majority'

const User = mongoose.model("User", new mongoose.Schema(
   {
      firstName: {
          type: String,
          required: true
      },
      lastName: {
          type: String,
          required: true
      },
      email: {
          type: String,
          required: true
      },
      password: {
          type: String,
          required: true
      }
  }
))

const Review = mongoose.model("Review", new mongoose.Schema(
   {
      firstName: {
          type: String,
          required: true
      },
      lastName: {
          type: String,
          required: true
      },
      userEmail: {
          type: String,
          required: true
      },
      score: {
          type: Number,
          required: true
      },
      reviewText: {
         type:String,
         required: true
      }
      
  }
))

const Staff = mongoose.model("Staff", new mongoose.Schema(
   {
      name: {type: String, required:true},
      booksy: {type: String},
      site: {type: String},
      link: {type: String},
      number: {type: String},
      speciality: {type: String},
      instagram: {type: String},
      hours: {
         M: [String],
         T: [String],
         W: [String],
         TH: [String],
         F: [String],
         SA: [String],
         SU: [String],
      },
      pricing: {
         "Men's Haircut": [String],
         "Men's Haircut & Beard": [String],
         "Kid's Haircut": [String],
         "Beard/Hair Lineup": [String],
         "Eyebrows/Black Face Mask": [String],
         "Full Service w/ Hot Towel Shave & Eyebrows": [String],
         "Before/After Hours Services": [String],
         "Women’s Haircut": [String],
         "Men’s Haircut & Eyebrows": [String],
         "Men’s Haircut, Eyebrows & Beard": [String],
      }
  }
))

passport.use(
   new LocalStrategy({usernameField: 'email'}, (email, attemptPassword, done) => {
      User.findOne({email: email})
         .then(user => {
            if(!user){
               console.log("No user with that email")
               return done(null, false, {message: 'No user with that email'})
            }
            else{
               try{
                  if (bcrypt.compare(attemptPassword, user.password)) {
                     return done(null, user)
                  } else {
                     console.log("Wrong password")
                     return done(null, false, {message: "Wrong password"})
                  }
               }catch(err){
                  console.log(err)
               }
            }
         })
}))

passport.serializeUser((user,done) => done(null, user.id))
passport.deserializeUser((id,done) => {
   User.findById(id, function(err, user){
      done(null, {
         firstName: user.firstName,
         lastName: user.lastName,
         email: user.email
      })
   })
})

console.log("Attempting connection to database...")
mongoose.connect(dbURL)
   .then(()=> {
      console.log("Connected to database")
   })
   .catch((err) => console.log(err))

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main'
}))

app.set('view engine', 'handlebars')
// Gets the current directory, and adds the "public" file
// This will display the html in the root directory of public. (no need to put it in the views folder)
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//File reader (for email)
function readFile() {
   return new Promise((resolve, reject) => {
      fs.readFile('public/email/email.html', 'utf8', function(err, data) {
         //console.log(data)
         resolve(data)
      })
   })
}
//Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'qualitystudiosbarbershop@gmail.com',//Tethered to my account(Jahi)
    pass: 'opensesame1999'
  }
});

const mailer = (recipient, content) => {
   transporter.sendMail({
      from: 'qualitystudiosbarbershop@gmail.com',
      to: recipient,
      subject: 'Welcome to Quality Studios!',
      attachments: [{
         filename: '/public/img/About-imageL.png',
         path: __dirname +'/public/img/About-imageL.png',
         cid: 'attachment' 
      }],
      html: content
      }
      , function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}
//Custom helpers (Will try to put them in a seperate file)
var hbs = expressHandlebars.create({});

hbs.handlebars.registerHelper("makeTable", function(staff) {
   dom = ''
   dom += '<table style="width: 100%" class="schedule" id="schedule">'
   dom += `
   <tr id="header">
      <th>Staff</th>
      <th>Monday</th>
      <th>Tuesday</th>
      <th>Wednesday</th>
      <th>Thursday</th>
      <th>Friday</th>
      <th>Saturday</th>
      <th>Sunday</th>
   </tr>`
   Object.values(this).forEach(person => {
      let img, role
      if (person.hours) {
         if (!person.photo) {
            img = 'default.png'
         } else {
            img = person.photo
         }
         switch (person.speciality) {
            case 'Barber':
            case 'Lash Technician':
               role = person.speciality.toLowerCase()
               break
            default:
               role = 'other'
         }
         dom += '<tr id="' + person.name + '">'
         dom += '<td class="' + role + '">' + '<img class= profile src="/img/' + img + '">&nbsp' + person.name + '</td>'
         Object.values(person.hours).forEach(day =>  {
            if (day.length > 1) {
               dom += '<td>' + day[0] + '-' + day[1] + '</td>'
            }
         })
         dom += '</tr>'
      }
   })
   dom += '</table>'
   return dom
})

hbs.handlebars.registerHelper("makeStars", function(review) {
   stars = this.score
   returnVal = ""
   for(i = 0; i < 5; i++){
      if(stars > 0){
         returnVal += "<span class='fa fa-star' style='color:orange;'></span>"
         stars -= 1
      }else{
         returnVal += "<span class='fa fa-star'></span>"
      }
   }
   return returnVal
})

hbs.handlebars.registerHelper("ifEqual", function(a, b, options) {
   if(a==b){return options.fn(this)}
})

/*This will load the homepage of the Website*/
app.get('/',(req,res)=>{
   res.render('home', {user: req.user})
})

app.get('/map',(req,res)=>{
    res.render('map', {user: req.user})
 })

 app.get('/social',(req,res)=>{
    res.render('social', {user: req.user})
 })

 app.get('/portfolio',(req,res)=>{
    res.render('portfolio', {user: req.user})
 })

 app.get('/reviews' , async (req,res)=>{
    const reviews = await Review.find({}).lean()
    res.render('reviews', {
      user: req.user,
      customReviews: reviews
      })
 })

app.get('/leaveReview', (req,res)=>{
   res.render('leaveReview', {style: "/css/login.css", user: req.user})
})

app.post('/leaveReview', (req,res)=>{
   try{
      // add review to the database
      console.log
      var firstName = req.user.firstName
      var lastName = req.user.lastName      
      var email = req.user.email       
      var reviewText = String(req.body.reviewText)      
      var score = req.body.score

      const reviewEntry = new Review({
         firstName: firstName,
         lastName: lastName,
         userEmail: email,
         score: score,
         reviewText: reviewText
      })

      reviewEntry.save()
         .then((result) => {
            res.redirect('/reviews')
         })
         .catch((err) => {
            console.log(err)
         })

   }catch(e){
      console.log(e)
      res.redirect('/leaveReview')
   }
})

 app.get('/staff', async (req,res)=>{
   const staff = await Staff.find({}).lean()
   console.log(staff)
   res.render('staff', {
      style: '/css/staff.css',
      script:'/scripts/staff.js',
      user: req.user,
      staff
   })
 })

  // Forces the user to log in to schedule an appointment
app.get('/schedule', async (req,res)=>{
   const staff = await Staff.find({}).lean()
   res.render('schedule', {
      style: '/css/schedule.css',
      script:'/scripts/schedule.js',
      staff,
      user: req.user
   })
   })

 app.get('/about',(req,res)=>{
    res.render('about', {user: req.user})
 })

 app.get('/login', checkNotAuthenticated,(req,res)=>{
   res.render('login', {style: "/css/login.css"})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
   successRedirect: '/',
   failureRedirect: '/login',
   failureFlash: true
}))

app.get('/register', checkNotAuthenticated,(req,res)=>{
   res.render('register', {
      style: "/css/login.css",
      script:'/scripts/register.js',
   })
})

app.post('/register', checkNotAuthenticated, async (req,res)=>{
   try{
      var email = String(req.body.email)
      let content = await readFile()
      User.findOne({email: email}).then(user => {
         if(!user){
             // add user to the database
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(String(req.body.password), salt)
            var fName = String(req.body.firstName)
            var lName = String(req.body.lastName)
            mailer(email, content)
            const userEntry = new User({
               firstName: fName,
               lastName: lName,
               email: email,
               password: hashedPassword
            })
            console.log("saving")
            userEntry.save()
               .then((result)=>{
                  res.redirect('/login')
               })
               .catch((err)=>{
                  console.log(err)
               })
         }
         else{
            console.log("User already Exists")
            res.redirect('/login')
         }
      })
   }catch(e){
      console.log(e)
      res.redirect('/register')
   }
})

app.get('/staffRegister',(req,res)=>{
   res.render('staffRegister', {style: "/css/login.css"})
})

app.post('/staffRegister', (req,res)=>{
   try{
      // add staff to the database
      var name = String(req.body.name)      
      var booksy = String(req.body.booksy)      
      var site = String(req.body.site)         
      var link = String(req.body.link)      
      var number = String(req.body.number)      
      var speciality = String(req.body.speciality)      
      var instagram = String(req.body.instagram)      

      const staffEntry = new Staff({
         name: name,
         booksy: booksy,
         site: site,
         link: link,
         number: number,
         speciality: speciality,
         instagram: instagram
      })

      staffEntry.save()
         .then((result) => {
            res.redirect('/staff')
         })
         .catch((err) => {
            console.log(err)
         })

   }catch(e){
      console.log(e)
      res.redirect('/register')
   }
})

app.delete('/logout', (req, res) => {
   req.logOut()
   res.redirect('/')
})

function checkNotAuthenticated(req, res, next) {
   if(req.isAuthenticated()){
      return res.redirect('/')
   }else{
      next()
   }
}

app.listen(port, ()=>console.log(
   `Express started on http://localhost:${port}; ` +
   `press Ctrl-C to terminate.`
))
