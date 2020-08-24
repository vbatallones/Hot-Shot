# Hot Shot

Player generator that you can search and see Player information.

## Technology includes

* Sequelize user model / migration
* Settings for PostgreSQL
* Passport and passport-local for authentication
* Sessions to keep user logged in between pages
* Flash messages for errors and successes
* Passwords that are hashed with BCrypt
* EJS Template and EJS Layouts
* Method over-ride
* JavaScript
* CSS 
* HTML


### NPM Install

Install all the packages 

        npm i

## DATABASE
Create a data base with association.

```JS
    user.js

    models.user.belongsToMany(models.player,{through: ('users_players')})

    player.js

     models.player.hasMany(models.comment)
      models.player.belongsToMany(models.user,{through: ('users_players')});

    users_players.js
    //join table for the user and the player

    comment.js

    models.comment.belongsTo(models.player)
```
## API 

Use [Sports Data API](https://sportsdata.io/) specifically in NBA data FEED API.

### ACCESS ALL PLAYERS

```js
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
```
#### Struggle

1. Confused on how the syntax of API will work. I thought it was the same for everyone, but figure it out to check on how is my API documentation that they have a specific format for their API call.

### ALL PLAYERS showing in the webpage

In this API route, I successfully got all my players and information showing in my terminal/webpage. 

Add a form for add to favorites that will generate the player into the users favorites

```html
<div class="result-container players">
    <% players.forEach(p => { %>
    <div class="result-items">
        
                <h3><a href="/nba/<%= p.PlayerID %>"><%= `${p.FirstName} ${p.LastName} #${p.Jersey}`%></a></h3>
                <img class="photo-url" src="<%= p.PhotoUrl  %> " alt="photo">
            
            <form method="POST" action="/nba">
            <input hidden type="text" name="name" id="name" value="<%= `${p.FirstName} ${p.LastName}` %> ">
            <input hidden type="text" name="photoUrl" id="photoUrl" value="<%= p.PhotoUrl %> ">
            <button type="submit">Pick 'Em</button>
            </form>
    </div>
    <% }) %>
</div>
```
### USER search for single player

Now all players are accessible the next step is when the user search a single player

```javascript
router.get('/search', (req, res) => {
    // getting what the user will input, either first name of last name
  let firstName;
  let lastName;
    // if the query return a name that includes a space, we now split the characters in to two parts
    // which is the first name is the first index and the last name is the second index
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
```

Push all the information in the empty array so that we can retrieve the data in the `search.ejs`.
All the in formation is in the `card` format from [Bootstrap](https://getbootstrap.com/docs/4.0/components/card/) and the same form format from all the player for the user to add the search player into the favorites.

```html
<div class="card" style="width: 18rem;">
  <% players.forEach(p => { %>
    <img src="<%= p.PhotoUrl  %> "  width="80px" class="card-photo" alt="photo">
    <div class="card-body">
      <h5 class="card-title"><%= `${p.FirstName} ${p.LastName} #${p.Jersey}`%> </h5>
      <p>Team: <%= p.Team %> </p>
      <p>Position: <%= p.Position  %> </p>
      <p>Status: <%= p.Status %> </p>
      <p>Salary: $<%= p.Salary %> </p>
      <p>Experience: <%= p.Experience %> </p>
      <form method="POST" action="/nba">
        <input hidden type="text" name="name" id="name" value="<%= `${p.FirstName} ${p.LastName}` %> ">
        <input hidden type="text" name="photoUrl" id="photoUrl" value="<%= p.PhotoUrl %> ">
        <button type="submit">Pick 'Em</button>
      </form>
  <% }) %> 
    </div>
  </div>
```
### When the user click the Pick 'Em button

When the user clicks the button `Pick 'Em` it add the player into the into the `database` and will be accessible for me to get their information into the `Profile.ejs` which all the favorite player will go.

```js
router.post('/', (req, res) => {
  
    db.player.findOrCreate({
      where: {
        name: req.body.name
      },
      defaults: { 
        image: req.body.photoUrl
      }
    })
    .then(([player, created]) => {
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
```
Favorite player Profile format. I only access the name and the image for my database table.

```js

<h1 class="favorite-player">Favorite Players</h1> 

<div class="result-container players">
    <% players.forEach(p => { %>
        <div class="result-items">
            <h3><%= p.name %> </h3>
            <img src="<%= p.image  %> " alt="photo">
            <form method="POST" action="/profile/delete/<%= p.id %> ">
                <button type="submit">DELETE</button>
            </form>
        </div> 
    <% }) %>
</div>
```

A form with a delete action, if the user wants to delete the favorite player.
I am not using the `Method over-ride` here but I will on the second delete button. I just want to try if this will work and it did, so I use this method of deleting my favorite player here. the `isLoggedIn` is part of my parameter because I did not change the profile file which is part of the auth app repo and just add it in my route `profile.js`.

```js
router.post('/delete/:id', isLoggedIn, (req, res) => {
    db.player.destroy({
        where: {
            id: req.params.id
        }
    });
    res.redirect('/profile')
})
```

### When the user clicks the name

If the User go to all the players and click the name of the player, There is a different API call going to happen which is the API link plus the player ID 

```html
<div class="card" style="width: 18rem;">
        <img src="<%= p.PhotoUrl  %> "  width="80px" class="card-photo" alt="photo">
    <div class="card-body">
        <h5 class="card-title"><%= `${p.FirstName} ${p.LastName} #${p.Jersey}`%> </h5>
        <p>Team: <%= p.Team %> </p>
        <p>Position: <%= p.Position  %> </p>
        <p>Status: <%= p.Status %> </p>
        <p>Salary: $<%= p.Salary %> </p>
        <p>Experience: <%= p.Experience %> </p>
        <form method="POST" action="/nba">
            <input hidden type="text" name="name" id="name" value="<%= `${p.FirstName} ${p.LastName}` %> ">
            <input hidden type="text" name="photoUrl" id="photoUrl" value="<%= p.PhotoUrl %> ">
            <button type="submit">Pick 'Em</button>
        </form>
    </div>
</div>
```
#### trying to figure out
 Instead of manually input the name in the comment form. I want the users, username to be inputted in the name section and I couldn't figure it out, that would be nice if I did that.

```html
  <div class="comment-form">
        <form method="POST" action="/nba/comment">
            <input type="hidden" name="playerId" value="<%= p.PlayerID %>">
            <label for="name">Name</label>
            <input class="form-control" type="text" name="name" id="name">
            <label for="content">Content</label>
            <textarea class="form-control" type="text" name="content" id="content"></textarea> 
            <button class="btn btn-primary comment-button" type="submit">Submit</button>
        </form>
    </div>
```


and the user can leave a comment on each player when the user preview the player. 
I want to access the player ID,because that is associated in my player table and will be known for the users and players join table.

Route for creating a comment and redirect into the player page where the comment will be seen.

```js
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
```
#### Struggle 

2. I have been struggling to access a single player ID, because I am confuse in the `req.query` or `req.params` and the  API have many Links for different category.

* In this route it will be fetching all the comment, when the user already has a comment

```js
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
  }) 
  .catch(err => {
    console.log('error', err)
  })
}) 
```

### UPDATE/DELETE COMMENT/s

Form for my update comment. Only the content will be updated. I am leaving the name whoever made the comment.

```html
<form method="POST" action="/nba/comment/<%= p.PlayerID%>/?_method=PUT">
    <input type="hidden" name="playerId" value="<%= p.PlayerID %>">
    <label for="content">Content</label>
    <textarea class="form-control" type="text" name="content" id="content"></textarea> 
    <button class="btn btn-primary" type="submit">Submit</button>
</form>
```
    This section is where the comment will be shown and modals that will pop-up for the user to edit comment if they don't like what they comment in.

```html
<div class="update-comment">
    <% comments.forEach((c, index) => { %>
        <h3 class="comment-name"> -<%= c.name %> </h3>
        <p class="comment-content">" <%= c.content %> "</p> 

    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#staticBackdrop">Edit</button>
        <div class="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Comment</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                    <div class="modal-body">
                        <form method="POST" action="/nba/<%= c.id%>?_method=PUT">
                        <!-- <textarea  type="text" name="content" id="content"></textarea>  -->
                        <textarea  type="text" class="form-control" name="content" id="content" value="<%= c.content %>"></textarea>
                        <input hidden type="text" name="name" id="name" value="<%= c.name %>">
                        <input hidden type="text" name="playerId" id="playerId" value="<%= c.playerId %>">
                    </div>

                    <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </form>
                    </div>
            </div>
        </div>
        </div>
    <form method="POST" action="/nba/<%= c.id %>?_method=DELETE">
        <button type="submit" class="btn btn-primary delete-comment-button">Delete Comment</button>
    </form>
        <% }) %>
</div>
```

#### Struggle

3. Having a hard to access the right content of the update route and where to redirect, but before that my form for my `action method PUT` is a mess when I was trying to figure out what info will be my target. The same for my delete route here in the update and delete route section. 

```js
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
```
In my update route I am redirecting back to the player ID, but in my delete route every time I try to redirect in the same it was just loading, so I just render to a different path and have a delete message to tell the user that the comment was deleted.

```js
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
```
here is my deleted render page when the user delete the comment.

```html
<div class="deleted">
    <h1><%= message %> </h1>
    <a href="/nba">Let's hoop back</a>
</div>
```
## Live site
[]()




### APPRECIATION SECTION

I struggle a lot in this project. It may not be as good as other, but I am proud of where I am right now. Slow progress, but I am getting there surely.

MOTTO:

 `Continue even if you are not fast as others, the most important thing is that you are moving forward`

 

## TA
* [Rome Bell]() Thank you for helping figure out the search for individual player and keep me moving on where I am in that day. that is a big help for me to know, where and how to start. <br />

* [Sarah King]() Thank you for helping me understand on how to check if the route is working or not and the request params. I appreciate your help in my update and delete route that I couldn't figure out. Big shout out for you! <br />

* [Taylor Darneille]() Thank you for the lessons, examples and motivating us to keep moving forward it really helps me.<br />

* [Pete Fitton]() Thank you PETE! for the lessons, examples and helping us debug a lot of stuff it really helps me.<br />

* [Adam Honre]() Thank you for the lessons, examples, and editing skills it really helps me.<br />

## TEAMS
[Yoel Morad]() Thank you Kuya for the long nights of coding and motivational wisdom, we got this bro. From zero to software     engineer. I'm always here for you

[Channee Math]() How we do bro? Thank you for putting me in my game as always bro, sending all those videos of motivation to keep us in the game. We can do this bro I'm here for you always Let's do this!

[Lizz Westerband]() Lizzz!! Thank you so much for being there for me, and to make me understand more what is going on in my routes.

[Nick Philips]() Thank you brother for helping me debug my update form and many others debugging.

[Shane Bendak]() Eyy yow! I appreciate your help on how to understand the ERD, models, association of the join table and the grid display.

[Barent Langwell]() Thank you so much Brother for being there for me helping debug codes and make it understand to me.
