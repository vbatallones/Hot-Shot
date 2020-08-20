require('dotenv').config();
const express = require('express');
const router = express.Router()
const db = require('../models')
const isLoggedIn = require('../middleware/isLoggedIn');
// Axios 
const axios = require('axios')

// API key
const API_KEY = process.env.API_KEY;


router.get('/', isLoggedIn, (req, res) => {
    
   
    db.player.findAll({})
    .then(players=>{
        console.log(players)
       res.render('profile', {players: players})
    })
      .catch((error) => {
      console.log(error)
      res.status(400)
    })
})

// DELETE ROUTE for favorite players
router.post('/delete/:id', isLoggedIn, (req, res) => {
    db.player.destroy({
        where: {
            id: req.params.id
        }
    });
    res.redirect('/profile')
})


module.exports = router;