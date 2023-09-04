import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config(); 

const router = express.Router();

// 비밀 키는 외부에 노출되면 안되겠죠? 그렇기 때문에, .env 파일을 이용해 비밀 키를 관리해야합니다.
const ACCESS_TOKEN_SECRET_KEY = process.env.AK; // Access Token의 비밀 키를 정의합니다.
const REFRESH_TOKEN_SECRET_KEY = process.env.RK; // Refresh Token의 비밀 키를 정의합니다.

// RT 관리할 객체
const tokenStorages = {}

// AK, RK 발급 API
router.post('', (req, res) => {
    // ID 전달
    const {id} = req.body;

    // AT, RT 발급
    const accessToken = jwt.sign({id:id}, ACCESS_TOKEN_SECRET_KEY, {expiresIn: '10s'});
    const refreshToken = jwt.sign({id:id}, REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'});
       
    // RT 발급받으면 상태정보가 저장됨.
    tokenStorages[refreshToken] = {
        id: id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    }
    // 클라이언트에게 쿠키(토큰)를 할당
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);

    return res.status(200).json({msg: 'Token 발급 완료!'});
});

export default router;