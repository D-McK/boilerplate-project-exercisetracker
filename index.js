const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');
require('dotenv').config()

app.use(cors())
app.use((bodyParser.urlencoded({extended: false})));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = [];

app.post("/api/users", (req, res) => {
  const uuid = uuidv4();
  const responseBody = {username: req.body.username, _id: uuid}
  users.push(responseBody);
  return res.json(responseBody);
})

app.get("/api/users", (req, res) => {
  return res.json(users);
})

app.post("/api/users/:_id/exercises", (req, res) => {
  const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
  const userObject = users.find(object => object._id === req.params._id);
  if (!userObject.log) userObject.log = [];
  const exerciseData = {date: date, description: req.body.description, duration: parseInt(req.body.duration)}
  userObject.log.push(exerciseData);
  return res.json({username: userObject.username, _id: userObject._id, ...exerciseData});
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userObject = users.find(object => object._id === req.params._id);
  if(Object.keys(req.query).length > 0){
    let logs = userObject.log;
    let filteredLogs = [];

    if(req.query.from){
      const startDate = new Date(req.query.from);
      logs.forEach(log => {
        if(new Date(log.date).getTime() > startDate.getTime()) filteredLogs.push(log);
      })
    }
    if(req.query.to) {
      const lastDate = new Date(req.query.to);
      logs.forEach(log => {
        if(new Date(log.date).getTime() < lastDate.getTime() && !filteredLogs.find(object => object === log)) filteredLogs.push(log);
      })
    }
    if(req.query.limit){
      const limit = parseInt(req.query.limit);
      filteredLogs = logs.splice(0, limit);
    }
    userObject.log = filteredLogs;
  }
  return res.json({...userObject, count: userObject.log.length});
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
