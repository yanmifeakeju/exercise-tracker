require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

require('./models/db')();
const User = require('./models/User');
const Exercise = require('./models/Exercise');

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.route('/api/exercise/users').get(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json(users);
});

app
  .route('/api/exercise/new-user')
  .get((req, res, next) => {
    res.send('route set up');
  })
  .post(async (req, res, next) => {
    const { username = undefined } = req.body;
    try {
      let user = await User.findOne({ username });
      if (user) {
        return res
          .status(400)
          .json({ status: false, message: 'Username already in use' });
      }
      user = await User.create({ username });
      
      return res.status(201).json({_id: user.id, username:user.username });
    } catch (error) {
      console.log(error.name);
    }
  });

app.route('/api/exercise/add').post(async (req, res, next) => {
  const {
    userId = undefined,
    description = undefined,
    duration = undefined,
    date = undefined,
  } = req.body;

  try {
    const user = await User.findById(userId);

console.log('user: ')
  console.log(user)

    if (!user) {
      return res
        .send(400)
        .send({ message: `User with ${userId} does not exist` });
    }

    Date.prototype.isValid = function () {
      // If the date object is invalid it
      // will return 'NaN' on getTime()
      // and NaN is never equal to itself.
      return this.getTime() === this.getTime();
    };

    if (!date) {
      const exercise = await Exercise.create({
        userId,
        description,
        duration,
      });

console.log('exercise')
      console.log(exercise)

  const expected = {
  username: user.username,
  description: exercise.description,
  duration: exercise.duration,
  _id: user._id,
  date: formatDate(exercise.date)
}
     return res
      .status(201)
      .json(expected);
    }

    const checkDate = new Date(req.body.date);

    if (!checkDate.isValid()) {
        const exercise = await Exercise.create({
        userId,
        description,
        duration,
      });

     return res.status(400).send('Invalid date provided');
    }

    const exercise = await Exercise.create({
      userId,
      description,
      duration,
      date,
    });

console.log('exercise')
    console.log(exercise)
   
    res
      .status(201)
      .json({
        _id: user._id,
        username: user.username,
        date: formatDate(exercise.date),
        duration: exercise.duration,
        description: exercise.description,
      });
  } catch (error) {
    console.log(error);
  }
});

app.route('/api/exercise/log').get(async (req, res, next) => {
  try {
    const {userId = undefined} = req.query
    const user = await User.findById(userId);


    if (!user) {
      return res
        .send(400)
        .send({ message: `User with ${userId} does not exist` });
    }
    let exercises;

    const details= {
      _id:user._id, 
      username: user.username,
    }
    

    if (!req.query.to && !req.query.from) {
      exercises = Exercise.find({ userId: req.query.userId });
    }



    if (req.query.from && req.query.to ) {
      
      exercises = await Exercise.find({
        userId: req.query.userId,
        date: { $gte: req.query.from, $lte: req.query.to },
      })
      details.to = req.query.to;
      details.from = req.query.from
    }

    if (!req.query.from && req.query.to) {
      exercises = Exercise.find({
        userId: req.query.userId,
        date: { $lte: new Date(req.query.to).toISOString() },
      })
      details.to = formatDate(req.query.to);
    }

    if (!req.query.to && req.query.from) {
       const to = formatDate(Date.now());
       console.log(to);
       console.log(formatDate(req.query.from))
      exercises = Exercise.find({
        userId: req.query.userId,
        date: { $gte: req.query.from, $lte: Date.now() },
      })
      details.from = formatDate(req.query.from);
    }

    if (req.query.limit) {
       exercises = exercises.limit(parseInt(req.query.limit));
    }

    const results = await exercises;

     exercises = results.map(exercise => {
        return {
          description: exercise.description,
          duration: exercise.duration,
          date: formatDate(exercise.date)
        }
     })


        details.count = exercises.length;
        details.log = exercises;

  return res.status(200).json(details);
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).json({ message: 'Invalid ID' });
    }
    next(error);
  }
});


function formatDate(param = null) {
  const date = param || Date.now();
  const newDate = new Date(date).toDateString();

  return newDate;
}

//Set up mongodb;
//Two schemas: exercise and user
//query options: a bit tricky

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
