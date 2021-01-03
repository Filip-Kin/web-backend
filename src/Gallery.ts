import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { DB } from './DB';
import { User, EDITOR_ROLE } from './User';

export class Gallery {
    private sql: DB;

    constructor(db: DB) {
        this.sql = db;
    }

    private createAlbum = async (name: string, weight: number, images: string[]): Promise<any> => {
        let album = <Album>{
            id: uuid(),
            name: name,
            weight: weight,
            images: images
        }
        let albumSql = {
            id: album.id,
            name: name,
            weight: weight,
            images: JSON.stringify(images)
        }
        await this.sql.query('INSERT INTO `gallery` SET ?', albumSql);
        return album
    }

    public handleCreateAlbum = async (req: Request, res: Response): Promise<any> => {
        if (!(await User.handleAuthSimple(req.body.user, EDITOR_ROLE))) {
            res.status(403);
            return res.send({ error: 'Authentication Error' })
        }

        if (!req.body.hasOwnProperty('name') ||
            !req.body.hasOwnProperty('weight') ||
            !req.body.hasOwnProperty('images')) {
            res.status(400);
            res.send({ error: 'Missing Parameters' });
        }

        try {
            let album = await this.createAlbum(req.body.name, req.body.weight, req.body.images);
            res.send({ album: album });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }
}

interface Album {
    id: string
    name: string
    weight: number
    images: string[]
}
