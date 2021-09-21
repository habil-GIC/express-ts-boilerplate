export default class Log {
    sequelize: any;
    Sequelize: any;
    constructor(sequelize: any, Sequelize: any) {
        this.sequelize = sequelize;
        this.Sequelize = Sequelize;
    }
    getLog() {
        const Log = this.sequelize.define("logs", {
            log_id:{
                type: this.Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            contact_id:{
                type: this.Sequelize.INTEGER,

            },
            // waktu_panggilan:{
            //     type: this.Sequelize.DATE,
            //     allowNull: true,
            // }
        
        })
        return Log;
    }
}