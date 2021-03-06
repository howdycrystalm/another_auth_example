var app = require('./../index');
var db = app.get('db');

var bcrypt = require('bcryptjs');

function hashPassword(password) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  return hash;
}

module.exports = {
  register: function(req, res, next) {
    var user = req.body;

    user.password = hashPassword(user.password);

    user.email = user.email.toLowerCase();

    db.user.user_create([user.name, user.email, user.password], function(err, newUser) {
      if (err) {
        console.log("Registration err: ", err);
        return res.status(401).send(err);
      }
      res.status(200).send('User created successfully!');
    })
  },

  read: function (req, res, next) {
    var searchOptions = {
			columns: ['id', 'name', 'email']
		};

    db.users.find(req.query, searchOptions, function(err, users) {
      if (err) {
				console.log('User read error: ', err);
				return res.status(401)
					.send(err);
			}

			res.status(200)
				.send(users);
    })
  },

  me: function(req, res, next) {
    if (!req.user) {
      res.status(401).send('User is not logged in');
    }
    var user = req.user;
    delete user.password;
    res.status(200).send(user);
  },

  update: function(req, res, next) {
    var updateUser = req.body;

    updateUser.id = req.user.id;

    db.users.save(updateUser, function(err, user) {
      if (err) {
				console.log('User update error', err);

				return res.status(401)
					.send(err);
			}

      req.user = user;

      delete user.password;

      res.status(200).send(user);
    })
  }
};
