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
    const { id } = req.body;

    // AT, RT 발급
    const accessToken = createAccessToken(id);
    const refreshToken = jwt.sign({ id: id }, REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });

    // RT 발급받으면 상태정보가 저장됨.
    tokenStorages[refreshToken] = {
        id: id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    }
    // 클라이언트에게 쿠키(토큰)를 할당
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);

    return res.status(200).json({ msg: 'Token 발급 완료!' });
});

// AT 검증 API
router.get('/validate', async (req, res) => {
    const { accessToken } = req.cookies;

    // AT가 존재하는지 확인
    if (!accessToken) {
        return res.status(400).json({ errMsg: 'AT가 존재하지 않습니다.' });
    }

    const payload = ValidateToken(accessToken, ACCESS_TOKEN_SECRET_KEY)

    if (!payload) {
        return res.status(400).json({ errMsg: 'AT이 정상적이지 않습니다.' });
    }

    const { id } = payload;
    return res.status(200).json({ msg: `${id}의 payload를 가진 Token이 정상적으로 인증 되었습니다.` });

})

// Token을 검증하고, payLoad 를 조회하기 위한 함수
function ValidateToken(token, secretKey) {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        return null;
    }
}

function createAccessToken(id) {
    return jwt.sign({id}, ACCESS_TOKEN_SECRET_KEY, {expiresIn: '10s'})
}

// RT를 이용해서 AT를 재발급 하는 API
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(400).json({ errMsg: 'RT가 존재하지 않습니다.' })
    }
    
    const payload = ValidateToken(refreshToken, REFRESH_TOKEN_SECRET_KEY);
    if (!payload) {
        return res.status(401).json({ errMsg: 'RT가 정상적이지 않습니다' });
    }

    const userInfo = tokenStorages[refreshToken];
    if(!userInfo) {
        return res.status(419).json({errMsg: 'RT가 서버에 존재하지 않습니다.'});
    }

    const newAccessToken = createAccessToken(userInfo.Id)

    res.cookie('accessToken', newAccessToken);
    return res.status(200).json({msg:'AT를 정상적으로 새롭게 발급했습니다.'})
});

export default router;