const secureEnv = require('secure-env');
const env = secureEnv({secret:'smecgic'})
process.env = { ...process.env, ...env }
import {db} from '../models';
const User: any = db.users;
import jwt from 'jsonwebtoken';
import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import { Sequelize } from 'sequelize';
const sequelize: any = new Sequelize({dialect: 'mysql'}); 


class AuthController {
    static login (req: Request, res: Response) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
        }
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({
            where: {
                username:username,
            },
        })
            .then((user: { dataValues: { password: any; }; token: string; }) => {
                if(!user) {
                    res.status(401).json({
                        message: "Username atau Password salah!"
                    })
                }
                else if (user.dataValues.password === password) {
                    const userData: any = user.dataValues;
                    console.log(`Login Berhasil ${userData}`);
                    let token = jwt.sign({ userData }, process.env.JWT_SECRET!, {
                        expiresIn: 172800,
                    }); 
                    user.token = token;
                    res.status(200).json({
                        message: "Login Berhasil",
                        token: token,
                        data: user,
                    });
                } else {
                    res.status(401).json({
                        message: "Password Salah!"
                    });
                }
            })
                .catch((err: any) => {
                    console.log(err);
                });
    }

    static register (req: Request, res: Response) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;

        if (!username || !password) {
            res.status(400).json({
                message: "Username dan Password harus diisi",
            });
            return;
        }

        const user = {
            username: username,
            password: password,
            role: role,
        };
        User.create(user)
            .then(() => {
                res.status(200).json({
                    success: true,
                    message: "Akun berhasil dibuat",
                });
            })
            .catch((err: any) => {
                console.log("error ", err.errors[0].message);
                res.status(500).json({
                    success: false,
                    message: err.errors[0].message || err.message || "Akun gagal dibuat",
                });
            });
    }

}
export {AuthController};