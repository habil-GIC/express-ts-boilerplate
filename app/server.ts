import express from 'express';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import {db} from './models';
import {Request, Response} from 'express';
import {router} from './routes/indexRoute';

type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[];

type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: StaticOrigin) => void) => void;

const app: express.Application = express();

let whiteList: any = [
    'http://localhost:7070'
];

let corsOption: any = {
    origin: function (origin: any, callback: any) {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOption));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

db.sequelize.sync();

app.get("/", (req: Request, res: Response) => {
    res.sendFile('index.html', { root: './app' })
});

app.use("/api/contacts", router);
const PORT: number | string  = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});