require('dotenv').config();
const express = require('express');
const router = express.Router()
const db = require('../models')
// Axios 
const axios = require('axios')

// API key
const API_KEY = process.env.API_KEY;

// first endpoint route for all players 
// should a aysnc method so we dont get a delay request when the user clicks the NBA players (ask for more details)
router.get('/', (req, res) => {
  let options = {
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY
    }
  }
  axios.get('https://api.sportsdata.io/v3/nba/scores/json/Players', options)
  .then((response) => {
    //console.log(response)
    let allPlayers = response.data
     res.render('nba/players', {player: allPlayers})
  }) 
  .catch(err => {
    console.log('error', err)
  })
}) 

router.get('/:name', (req, res) => {
  console.log(req.query)
  // getting what the user will input, either first name of last name
  let firstName;
  let lastName;
  // if the query return a name that includes a space, we now split the characters in to two parts
  // which is the fisrt name is the first index and the last name is the second index
  if (req.query.name.includes(' ')) {
     firstName = req.query.name.split(' ')[0];
     lastName = req.query.name.split(' ')[1];
  } else {
     firstName = req.query.name;
     lastName = "";
  }
  let options = {
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY
    }
  }
  axios.get(`https://api.sportsdata.io/v3/nba/scores/json/Players`, options)
  .then((response) => {
   let allPlayers = response.data;
   
   //console.log(allPlayers)
    let players = [];
  //for loop search for each name of the players
      for (let i = 0; i < allPlayers.length; i++) {
        let eachPlayer = allPlayers[i];
        let firstNameResult = eachPlayer.FirstName.toLowerCase();
        let lastNameResult = eachPlayer.LastName.toLowerCase();
        if (firstNameResult === firstName.toLowerCase()) {
              players.push(eachPlayer)
         }
      }
        res.render('nba/search', {players})
  }) 
  .catch(err => {
    console.log(err)
  })
})
// router.post('/search', (req, res) => {

// })

  module.exports = router;