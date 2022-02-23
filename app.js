var express = require('express');
var path = require('path');
var logger = require('morgan');
require("./config/database");
var cors = require('cors');
var path = require("path");

var usersRouter = require('./app/routes/users');
var homeRouter = require('./app/routes/home');
var cursosRouter = require('./app/routes/cursos');
var sobreRouter = require('./app/routes/sobre');
var mediaSocialRouter = require('./app/routes/mediaSocial');
var contatoRouter = require('./app/routes/contato');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


app.use('/users', usersRouter);
app.use('/home', homeRouter);
app.use('/cursos', cursosRouter);
app.use('/sobre', sobreRouter);
app.use('/social-media', mediaSocialRouter);
app.use('/contato', contatoRouter);
app.use('/files', express.static(path.resolve(__dirname, "public", "images")));

module.exports = app;
