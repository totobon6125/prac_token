import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config(); 

import indexRouter from './routes/index.js'; 

const app = express();
const PORT = process.env.port;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  return res.status(200).send('Hello Token!');
});

app.use('/token', indexRouter);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});