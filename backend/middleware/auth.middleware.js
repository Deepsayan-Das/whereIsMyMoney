import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.services.js';

export const authUser = async (req, res, next) => {
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')){
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const isBlackListed = await redisClient.get(token);
    if (isBlackListed) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        req.user = decoded;
        next();
    })
}