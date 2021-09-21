export default class User {
    sequelize: any;
    Sequelize: any;
    constructor(sequelize: any, Sequelize: any) {
        this.sequelize = sequelize;
        this.Sequelize = Sequelize;
    }
    getUser() {
        const User = this.sequelize.define("user", {
        user_id: {
            type: this.Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: this.Sequelize.STRING,
        },
        password: {
            type: this.Sequelize.STRING,
        },
        token: {
            type: this.Sequelize.STRING,
        },
        role: {
            type: this.Sequelize.STRING,
            validate: {
                isIn: [['user', 'admin']],
            },
        },
    });

    return User;
    }
}