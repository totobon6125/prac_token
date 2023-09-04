import express from 'express';
import tokenRouter from './token.router.js';

const router = express.Router();    

router.use('', tokenRouter);  

export default router;