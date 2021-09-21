import User from './userModel';
import Contact from './contactModel';
import Log from './logModel';
import { mysqlConfig } from '../config/dbConfig'

const Sequelize: any = require('sequelize');
const sequelize: any = new Sequelize(
    mysqlConfig.DB, 
    mysqlConfig.USER,
    mysqlConfig.PASSWORD, {
        host: mysqlConfig.HOST,
        dialect: 'mysql',
        operatorAliases: false
    });

const userModel: any = new User(sequelize, Sequelize);
const contactModel: any = new Contact(sequelize, Sequelize);
const logModel: any = new Log(sequelize, Sequelize);
const db: any = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = userModel.getUser()
db.contacts = contactModel.getContact()
db.log = logModel.getLog()

export {db};