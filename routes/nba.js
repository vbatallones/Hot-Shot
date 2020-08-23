require('dotenv').config();
const express = require('express');
const router = express.Router()
const db = require('../models')

// Axios 
const axios = require('axios')

// API key
const API_KEY = process.env.API_KEY;

// ---------------------- GET route. show all players ---------------------
router.get('/', async (req, res) => {
  let options = {
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY
    }
  }
  await axios.get('https://api.sportsdata.io/v3/nba/scores/json/Players', options)
  .then((response) => {
    //console.log(response)
    let allPlayers = response.data
    res.render('nba/players', {players: allPlayers})
  }) 
  .catch(err => {
    console.log('error', err)
  })
}) 


//----------------- GET route. SEARCH for individual player ------------------
router.get('/search', (req, res) => {
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

// ---------- GET route. Link name get by id,comment on the player and preview the player ---------------
router.get('/:id', async (req, res) => {
  let options = {
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY
    }
  }
  await axios.get(`https://api.sportsdata.io/v3/nba/scores/json/Player/${req.params.id}`, options)
  .then((response) => {
    let player = response.data
    db.comment.findAll({
      where: {playerId: req.params.id}
    })
    .then((comments) => {
      res.render('nba/preview', { p: player, comments: comments })
    })
    .catch((error) => {
      console.log(error)
      res.status(400)
    })
    //res.render('nba/preview', {p: player})
  }) 
  .catch(err => {
    console.log('error', err)
  })
}) 

// --------------------- POST route for add my players to database ----------------------------

// router.post('/', (req, res) => {
//   console.log(req.body)
//   db.player.findOrCreate({
//     where: { 
//       name: req.body.name,
//       image: req.body.photoUrl
//     }
//   })
//   .then(([faves, created]) => {
//     res.redirect('/nba')
//   })
//   .catch(err => {
//     console.log('Error', err)
//   })
// })

// ------------------------------- POST route for user and players association ---------------


router.post('/', (req, res) => {
  console.log('😀', req.body)
  
    db.player.findOrCreate({
      where: {
        name: req.body.name
      },
      defaults: { 
        image: req.body.photoUrl
      }
    })
    .then(([player, created]) => {
     // console.log(`This was created: ${created}`)
      db.users_players.findOrCreate({
        where: {
          userId: req.user.id,
          playerId: player.id
        }
      })
      .then(([fave, faveCreated]) => {
        console.log(fave.get())
        res.redirect('back')
      })
      .catch(err => {
        console.log('Error', err)
    })
      .catch(err => {
        console.log('Error', err)
    })
  })
})


// ------------------------------- POST comments on each players ------------------------------

router.post('/comment', (req, res) => {
  console.log('req.body')
  console.log(req.body)
  db.comment.create(
    req.body
  )
  .then((comment) => {
    if (!comment) throw Error()
    res.redirect('/nba/' + req.body.playerId)
  })
  .catch((error) => {
    console.log(error)
    res.status(400)
  })
})

// ------------------- PUT route. UPDATE comment ---------------------

router.put('/:id', (req, res) => {
  db.comment.update({
    content: req.body.content,
  }, {
    where: {
      id: req.params.id
    }
}).then(response=>{
    res.redirect(`/nba/${req.body.playerId}`)
})
.catch(err => {
  console.log("error", err)
})
})


// //------------------ DELETE comment on players-----------------

router.delete('/:id', (req, res) => {
  db.comment.destroy({
      where: {
          id: req.params.id
      }
  })
    .then((comment) => {
      res.render(`nba/deleted`, {message: "Your comment is deleted"} )
    })
})




  module.exports = router;