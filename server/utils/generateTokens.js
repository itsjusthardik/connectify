import jwt from 'jsonwebtoken';

const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

export { generateAccessToken, generateRefreshToken };
