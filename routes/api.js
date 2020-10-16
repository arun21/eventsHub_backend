const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../models/user");

const mongoose = require("mongoose");
const db =
  "mongodb+srv://user_test:password_test@events.sms68.mongodb.net/eventsdb?retryWrites=true&w=majority";

const news_url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${process.env.NEWS_API_KEY}`;

mongoose.connect(db, (err) => {
  if (err) {
    console.error("Error!" + err);
  } else {
    console.log("Connected to mongodb");
  }
});

router.get("/", (req, res) => {
  res.send("Hello from API route");
});

router.post("/register", (req, res) => {
  let userData = req.body;
  user = new User(userData);
  user.save((error, registeredUser) => {
    if (error) {
      console.log(error);
    } else {
      let payload = { subject: registeredUser._id }
      let token = jwt.sign(payload, 'secretKey')
      res.status(200).send({email:registeredUser.email, token});
    }
  });
});

router.post("/login", (req, res) => {
  let userData = req.body;
  User.findOne({ email: userData.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (!user) {
        res.status(401).send("Invalid email");
      } else {
        if (user.password !== userData.password) {
          res.status(401).send("Invalid password");
        } else {
          let payload = {subject: user._id}
          let token = jwt.sign(payload, 'secretKey')
          res.status(200).send({email:user.email, token});
        }
      }
    }
  });
});

router.get("/top-events", async (req, res) => {
  const data = await fetch(news_url)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  if (data.status == "ok") {
    res.status(200).send(data.articles);
  } else {
    res.status(401).send(data.message);
  }
});

router.get("/top-headlines", async (req, res) => {
  const country = req.query.code || 'in';
  const top_headlines = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${process.env.NEWS_API_KEY}`;
  
  const data = await fetch(top_headlines)
    .then((response) => response.json())
    .then((data) => { return data; });
  if (data.status == "ok") {
    res.status(200).send(data.articles);
  } else {
    res.status(401).send(data.message);
  }
});

router.get("/special", async (req, res) => {
  let events = "";
  const country = req.query.code;
  const special_events = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${country}&apikey=${process.env.TICKET_MASTER_API_KEY}`;
  
  const data = await fetch(special_events)
  .then((response) => response.json())
  .then((data) => { return data; });
  if (data) {
    res.status(200).send(data._embedded.events);
  } else {
    res.status(401).send(data.message);
  }
});

module.exports = router;
