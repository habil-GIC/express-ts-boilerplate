const secureEnv = require('secure-env');
const env = secureEnv({secret:'smecgic'})
process.env = { ...process.env, ...env }

export const mysqlConfig: any = {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    DB: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
}

export const redisConfig: any = {
    port: process.env.REDIS_PORT, // Redis port
    host: process.env.REDIS_HOST, // Redis host
    family: process.env.REDIS_FAMILY, // 4 (IPv4) or 6 (IPv6)
    db: process.env.REDIS_DB,
}



