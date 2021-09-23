import express from 'express';
import bodyParser from 'body-parser';
import Cors from 'cors';
const cors = Cors();
import {db} from './models';
import {Request, Response} from 'express';
import {router} from './routes/indexRoute';
import Queue from 'bull'

type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[];

type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: StaticOrigin) => void) => void;

const app: express.Application = express();


app.use(cors);
app.use(function(req, res, next) {
    req.header('Access-Control-Request-Headers');
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,x-token,application-id,module-id,Authorization');

    next();
});
export const firstQueue = new Queue('logging');
                firstQueue.process(function(job, done) {
                    console.log('sdjakdsjakdja')
                    job.progress(42);
                    done();
                })

                
// let corsOption: any = {
//     origin: function (origin: any, callback: any) {
//         if (whiteList.indexOf(origin) !== -1 || !origin) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }



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