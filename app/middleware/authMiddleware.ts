import 'dotenv/config'
import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from 'express'

declare global {
    namespace Express {
        export interface Request {
        user: any;
        }
    }
}


class Auth {
    static checkToken(req: Request, res: Response, next: NextFunction) {
        // let x: any;
        const authorizationHeader = req.header("Authorization");
        const token = (authorizationHeader && authorizationHeader !== '') ? authorizationHeader.split(' ')[1] : undefined
        // const token: string = (x = authorizationHeader) === null || x === void 0 ? void 0 : x.replace("Bearer ", "");
        console.log("token ", typeof token);
        if (!token) {
            res.status(404).json({
                success: false,
                message: "Silahkan login terlebih dahulu",
            });
        }
        
        jwt.verify(token!, process.env.JWT_SECRET!, (err: any, userJwt: any) => {
            req.user = userJwt.userData;
            if (err) {
                res.status(401).json({
                    message: "Akun tidak terdaftar",
                });
            }
            next();    
        });
    }

}

export default Auth;
