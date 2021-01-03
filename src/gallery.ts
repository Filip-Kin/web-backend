import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { DB } from './db';
import { User, EDITOR_ROLE } from './User';

export class Gallery {
    private sql: DB;

    constructor(db: DB) {
        this.sql = db;
    }

    private createAlbum = async (req: Request,res: Response):Promise<any> => {
        console.log(uuid())
        console.log(`${JSON.stringify(req.body.images)}`)
        this.sql.query(`INSERT INTO gallery (id, name, weight, images) VALUES ("${uuid()}", "${req.body.name}", "${req.body.weight}', "${JSON.stringify(req.body.images)}")`).then((value) => {
           // console.log(value)
        }).catch(reason => {
            console.log(reason)
        })
    }

    public handleCreateAlbum = async(req: Request, res: Response):Promise<any> => {
        /*if (!(await User.handleAuthSimple(req.body.user, EDITOR_ROLE))) {
            res.status(403);
            return res.send({ error: 'Authentication Error' })
        }
*/
        if (!req.body.hasOwnProperty('name')) {
            res.status(400);
            res.send({ error: 'Missing Parameters' });
        }

        try {
            let post = await this.createAlbum(req, res);
            res.send({ post: post });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }
}