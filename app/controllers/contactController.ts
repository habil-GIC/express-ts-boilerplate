const secureEnv = require('secure-env');
const env = secureEnv({secret:'smecgic'})
process.env = { ...process.env, ...env }
import { mysqlConfig } from "../config/dbConfig";
import {db} from "../models";
import Redis from 'ioredis';
import mysql from 'mysql2';
import {Request, response, Response} from 'express';
import axios from "axios";
import Queue from "bull";
import { firstQueue } from "../server";
import nodemailer from 'nodemailer'
import { fcmMessage } from "../models/firebaseModel";
const FCM = require('fcm-node')
const serverKey = process.env.FIREBASE_SERVER_KEY || 'AAAA6tnNjBU:APA91bESmq96JgDD9FTcx2hJvANDICa_bF7Fd_tHP4U1oGWEw6bH0zVn3K_JHdfWP48_2gg_UHyCC3umYlRPj2bk49I_3ExLqoHDbVnRrLFjZ2uQgTW7TnDSQaPcWHSY7cLoguUJoTEC';
const fcm = new FCM(serverKey)
const redis: any = new Redis();
const Op: any = db.Sequelize.Op;

class ContactController{

    // Create contact
         static create = (req: Request, res: Response) => {
        // kondisi request
        if (!req.body.nama) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return ;
        }
        // tambah kontak
        const contact = {
            nama: req.body.nama,
            no_hp: req.body.no_hp,
            email: req.body.email
        };
        
        const data = {
            nama: 'Magic Of The Moment',
            uniqueToken: 'djj1je19124wq8yda81adh180djsa10u13'
        }

        const options = {
            delay: 60000,
            attempts: 2
        }
        // tambah kontak ke mysql
        // Contact.create(contact)
        //     .then((data) => {
        //         res.send(data);
        //     }).catch((err) => {
        //         res.status(500).send({
        //             message:
        //                 err.message || "Some error occurred while creating the Contact."
        //         })
        //     });
        const connection = mysql.createConnection({
            host: mysqlConfig.HOST,
            user: mysqlConfig.USER,
            password: mysqlConfig.PASSWORD,
            database: mysqlConfig.DB,
          });
          connection.query('ALTER TABLE contacts CHANGE COLUMN createdAt createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP')
          connection.query('ALTER TABLE contacts CHANGE COLUMN updatedAt updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP')
          let sql: any = 'INSERT INTO contacts SET ?'
          connection.query(sql, contact, function(err, dataContact) {
            if(err) {
                res.send(err);
                console.log(err);
            }
            else{
                res.status(200).send({
                    message: 'Data berhasil ditambahkan',
                    data: dataContact
                });
                fcm.send(fcmMessage, function(err: any, response: Response) {
                    if(err){
                        console.log('dssasdas')
                        console.log(err)
                    }else {
                        redis.set('fcmResponse', JSON.stringify(response))
                    }
                })
                firstQueue.add(data, options)
                redis.del('contact');
            };
          });
    };
    
    // get all contact
        static findAll = async (req: Request, res: Response) => {
            try{
            const nama: any = req.query.nama;
            // let condition = nama ? { nama: { [Op.like]: `%${nama}%` } } : null;
            
            redis.get('contact', async (err: any, contact: any) => {
                    if (err) {
                        res.sendStatus(404);
                    }
                    //kalo tabelredisnya ada, hapus lalu buat lagi, supaya selalu refresh
                    if (contact) {
                        res.send(JSON.parse(contact));
                        
                        //kalo gaada, buat baru
                    } else {
                        // const contactData = await Contact.findAll({
                        //      where: condition,
                        //      limit: limit ? parseInt(limit) : Number.MAX_SAFE_INTEGER + 1,
                        //      offset: limit &&  page? (parseInt(page) - 1) * parseInt(limit) : 0,
                        //     })
                        const connection = mysql.createConnection({
                            host: mysqlConfig.HOST,
                            user: mysqlConfig.USER,
                            password: mysqlConfig.PASSWORD,
                            database: mysqlConfig.DB,
                          });
                        let sql = 'SELECT * FROM `contacts`';
                        connection.execute(sql, function(err, contactData){
                            redis.set('contact', JSON.stringify(contactData));
                            res.json(contactData);
                            return;
                        })
                    }
                });
        } catch (err){
                res.sendStatus(500).json({
                    msg: "Data tidak bisa ditampilkan"
                });
            }      
    };
    
    
    // edit contact
        static update = (req: Request, res: Response) => {
        const id = req.params.id;
    
        // Contact.update(req.body, {
        //     where: { id: id }
        // }).then((result) => {
        //     if ( result == 1 ) {
        //         res.send({
        //             message: "Contact was updated successfully"
        //         });
        //     } else {
        //         res.send({
        //             message: `Cannot update Contact with id=${id}.`
        //         })
        //     }
        // }).catch((err) => {
        //     res.status(500).send({
        //         message: "Error updating contact with id=" + id
        //     })
        // });
        const connection = mysql.createConnection({
            host: mysqlConfig.HOST,
            user: mysqlConfig.USER,
            password: mysqlConfig.PASSWORD,
            database: mysqlConfig.DB,
          });
        let sql = `UPDATE contacts SET ? WHERE contact_id = ? `
        connection.query(sql, [req.body, id], function(err, dataContact) {
            if(err){
                res.status(401)
                console.log(err);
            }else{
                res.status(200).send({
                    message: 'Data berhasil di update',
                    data: dataContact
                })
                redis.del('contact');
            }
        })
    };

            
    // delete contact by id
        static delete = (req: Request, res: Response) => {
        const id = req.params.id;
    
        // Contact.destroy({
        //     where: { id: id }
        // }).then((result) => {
        //     if (result == 1) {
        //         res.send({
        //             message: "Contact was deleted successfully"
        //         })
        //     } else {
        //         res.send({
        //             message: `Cannot delete contact with id=${id}`
        //             })
        //         }
        //     }).catch((err) => {
        //         res.status(500).send({
        //             message: "Could not delete contact with id=" + id
        //         })
        //     });
        const connection = mysql.createConnection({
            host: mysqlConfig.HOST,
            user: mysqlConfig.USER,
            password: mysqlConfig.PASSWORD,
            database: mysqlConfig.DB,
          });
        let sql = `DELETE FROM contacts WHERE contact_id = ?`
        connection.query(sql, id, function(err, dataContact){
            if(err){
                res.status(400)
                console.log(err)
            }else{
                res.status(200).send({
                    message: 'Data berhasil dihapus',
                    data: dataContact
                })
                redis.del('contact');
            }
        })
        };
    
        static join = (req: Request, res: Response) => {
            const connection = mysql.createConnection({
                host: mysqlConfig.HOST,
                user: mysqlConfig.USER,
                password: mysqlConfig.PASSWORD,
                database: mysqlConfig.DB,
              });
            
            const sendMailQueue = new Queue('sendMail')
            const data = {
                email: 'habilmuhammad20@gmail.com'
            }

            const options = {
                delay: 15000
            }
            
            function sendMail(email: string) {
                return new Promise((resolve, reject) => {
                    let mailOptions = {
                        from: 'habil@gic-indonesia.com',
                        to: email,
                        subject: 'Testing Queue',
                        text: 'tewahadhadijaijdwijadijawd.'
                    };
                    let mailConfig = {
                        service: 'gmail',
                        auth: {
                            user: 'habil@gic-indonesia.com',
                            pass: '19April2000'
                        }
                    };
                    nodemailer.createTransport(mailConfig).sendMail(mailOptions, (err, info) => {
                        if(err) {
                            reject(err); 
                        }else {
                            resolve(info)
                        }
                    })
                })
            }

            let sql = 'SELECT C.nama, C.no_hp, C.email FROM `logs` L JOIN contacts C ON C.contact_id = L.contact_id';
            connection.execute(sql, function(err, results) {
                sendMailQueue.add(data, options);
                sendMailQueue.process(async job => {
                    return await sendMail(job.data.email)
                })
                res.json(results);
                return;
            })
    
        }

        static tesAxios = (req: Request, res: Response) => {
            const contact = {
                nama: req.body.nama,
                no_hp: req.body.no_hp,
                email: req.body.email
            };
            axios.get('http://localhost:8080/api/contacts/daftar',
            {
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRGF0YSI6eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImhhYmlsIiwicGFzc3dvcmQiOiIxMjM0IiwidG9rZW4iOm51bGwsInJvbGUiOiJhZG1pbiIsImNyZWF0ZWRBdCI6IjIwMjEtMDktMjFUMDQ6MjU6NDAuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjEtMDktMjFUMDQ6MjU6NDAuMDAwWiJ9LCJpYXQiOjE2MzIyOTcxMTQsImV4cCI6MTYzMjQ2OTkxNH0.v9b2ope_D47od56yUd9hrWWrzSNu7cA4GUHeFBTVr40'
                }
            }) 
            .then(function(result) {
                res.json(result.data)
            })
            .catch(function(err) {
                res.json(err)
            })
            
            
            
        }

    
        
    }

export {ContactController};
