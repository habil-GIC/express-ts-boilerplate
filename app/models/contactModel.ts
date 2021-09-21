export default class Contact {
    sequelize: any;
    Sequelize: any;
    constructor(sequelize: any, Sequelize: any) {
        this.sequelize = sequelize;
        this.Sequelize = Sequelize;
    }
    getContact() {
        const Contact = this.sequelize.define("contacts", {
        
        contact_id:{
            type: this.Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },    
        nama: {
            type: this.Sequelize.STRING,
            unique: true,
        },
        no_hp: {
            type: this.Sequelize.STRING
        },
        email: {
            type: this.Sequelize.STRING,
            validate: {
                isEmail: {
                    args: true,
                    msg: "Format Email tidak Benar",
                },
            },
            unique: true,
        },
    });
    return Contact;
    }
}