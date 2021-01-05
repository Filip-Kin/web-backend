import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { DB } from './DB';
import { User, EDITOR_ROLE } from './User';
import { deleteFile } from './Store';

export class Gallery {
    private sql: DB;

    constructor(db: DB) {
        this.sql = db;
    }

    public getAlbum = async (id: string): Promise<Album> => {
        let result = (await this.sql.query('SELECT * FROM `gallery` WHERE `id` = ?;', [id]));
        if (result.length !== 1) throw new Error('Album not found');
        result[0].images = JSON.parse(result[0].images);
        return <Album>result[0];
    }

    public handleGetAlbum = async (req: Request, res: Response): Promise<any> => {
        try {
            let album = await this.getAlbum(req.params.id);
            res.send({ album: album });
        } catch (err) {
            res.status(404);
            res.send({ error: err });
        }
    }

    public getAlbums = async (): Promise<Album[]> => {
        return (await this.sql.query('SELECT * FROM `gallery` ORDER BY `weight` DESC;'))
            .map(x => (<Album>{
                id: x.id,
                name: x.name,
                weight: x.weight,
                images: JSON.parse(x.images)
            }));
    }

    public handleGetAlbums = async (req: Request, res: Response): Promise<any> => {
        let albums = await this.getAlbums();
        res.send({ albums: albums });
    }



    public createAlbum = async (name: string, weight: number, images: string[]): Promise<any> => {
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

    public deleteAlbum = async (id: string): Promise<any> => {
        for (let file of (await this.getAlbum(id)).images) {
            deleteFile(file);
        }
        await this.sql.query('DELETE FROM `gallery` WHERE `id` = ?', [id]);
        return;
    }

    public handleDeleteAlbum = async (req: Request, res: Response): Promise<any> => {
        try {
            await this.deleteAlbum(req.params.id);
            res.send({ success: true });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }

    public updateAlbum = async (id: string, images: string[] = undefined, weight: number = undefined, name: string = undefined): Promise<any> => {
        let update = {
            images: JSON.stringify(images),
            weight: weight,
            name: name
        };
        await this.sql.query('UPDATE `gallery` SET ? WHERE `id` = ?', [update, id]);
        return;
    }

    public handleWeightAlbum = async (req: Request, res: Response): Promise<any> => {
        try {
            let album = await this.updateAlbum(req.params.id, undefined, parseInt(req.params.weight));
            res.send({ album: album });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }

    public handleRenameAlbum = async (req: Request, res: Response): Promise<any> => {
        try {
            let album = await this.updateAlbum(req.params.id, undefined, undefined, req.params.name);
            res.send({ album: album });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }

    public addToAlbum = async (id: string, file: string): Promise<Album> => {
        let a = await this.getAlbum(id);
        a.images.push(file);
        await this.updateAlbum(id, a.images);
        return a;
    }

    public handleAddToAlbum = async (req: Request, res: Response): Promise<any> => {
        try {
            let album = await this.addToAlbum(req.params.id, req.params.file);
            res.send({ album: album });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }

    public removeFromAlbum = async (id: string, file: string): Promise<Album> => {
        let a = await this.getAlbum(id);
        let i = a.images.indexOf(file);
        if (i > -1) {
            a.images.splice(i, 1);
        }
        await this.updateAlbum(id, a.images);
        return a;
    }

    public handleRemoveFromAlbum = async (req: Request, res: Response): Promise<any> => {
        try {
            let album = await this.removeFromAlbum(req.params.id, req.params.file);
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
