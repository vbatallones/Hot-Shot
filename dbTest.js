require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const SECRET_SESSION = process.env.SECRET_SESSION;
const flash = require('connect-flash');

// Axios 
const axios = require('axios')
const API_KEY = process.env.API_KEY
console.log(API_KEY)
app.get('/player', (req, res) => {
    let options = {
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY
      }
    }
    axios.get('https://api.sportsdata.io/v3/nba/scores/json/Player/20000571', options)
    .then((response) => {
      console.log(response.data)
    })
})