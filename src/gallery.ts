import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { DB } from './db';
import { User, EDITOR_ROLE } from './User';

export class Gallery {
    private sql: DB;

    constructor(db: DB) {
        this.sql = db;
    }

    public createAlbum() {
        this.sql.query("SELECT * FROM `gallery`").then((value) => {
            return value
        }).catch(reason => {
            throw new Error(reason);
        })
    }
}