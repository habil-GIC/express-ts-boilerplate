const secureEnv = require('secure-env');
const env = secureEnv({secret:'smecgic'})
process.env = { ...process.env, ...env }
import { mysqlConfig } from "../config/dbConfig";
import {db} from "../models";
import Redis from 'ioredis';
import mysql from 'mysql2';
import {Request, Response} from 'express';
import axios from "axios";
const redis: any = new Redis();
const Op: any = db.Sequelize.Op;

class ContactController{

        static testAxios = (req: Request, res: Response) => {
            axios.get('/api/contacts/testingaxios')
            .then(function(response){
                res.send({
                    message: 'sukses'
                })
            })
            .catch(function(error){
                res.send(error)
            })
        }

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
            
            let sql = 'SELECT C.nama, C.no_hp, C.email FROM `logs` L JOIN contacts C ON C.contact_id = L.contact_id';
            connection.execute(sql, function(err, results) {
                res.json(results);
                return;
            })
    
        }
    
        
    }

export {ContactController};
