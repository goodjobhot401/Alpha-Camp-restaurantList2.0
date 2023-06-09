const express = require('express')
const router = express.Router()
const Member = require('../../models/user')
const passport = require('passport')
const bcrypt = require('bcryptjs')

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}))

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []

  if (!email || !password || !confirmPassword) {
    errors.push({ message: '除了 name 所有欄位都是必填' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不相符' })
  }
  if (errors.length) {
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword
    })
  }

  Member.findOne({ email }).then(member => {
    if (member) {
      errors.push({ message: '這個 email 已經被註冊過' })
      res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword
      })
    }

    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => Member.create({
        name,
        email,
        password: hash
      }))
      .then(() => res.redirect('/'))
      .catch(err => res.render('errorPage', { error: err.message }))
  })
})

router.get('/logout', (req, res) => {
  req.logOut()
  req.flash('success_msg', '你已經成功登出!')
  res.redirect('/users/login')
})



module.exports = router