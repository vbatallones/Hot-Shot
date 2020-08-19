'use strict';
const bcrypt = require('bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.user.belongsToMany(models.player,{through: ('users_players')})
    }
  };
  user.init({
    name: {
      type: DataTypes.STRING,
      // validating a name
      validate: {
        //sequelize syntax of length is len and argument is args
        len: {
          //length of name which is 1 to 99 characters
          args: [1, 99],
          msg: 'Name must be 1 to 99 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      //validating email
      validate: {
        //to validate email we will use isEmail syntax
        isEmail: {
          msg: 'Invalid email'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8, 99],
          msg: 'Password must be between 8 and 99 character'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'user',
  });
  user.addHook('beforeCreate', function(pendingUser) {
    //this will return a string of characters. hash the password for us
    let hash = bcrypt.hashSync(pendingUser.password, 12);
    //set password to the hash
    pendingUser.password = hash;
  });

  user.prototype.validPassword = function(passwordTyped) {
    let correctPassword = bcrypt.compareSync(passwordTyped, this.password)
    // return true or false based on correct password
    return correctPassword;
  }

  // remove the password before it get serialized/ create a session for the usersake.
  user.prototype.toJSON = function() {
    let userData = this.get();
    delete userData.password;
    return userData;
  }

  return user;
  
};