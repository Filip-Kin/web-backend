import { hash, compare } from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { DB } from './db';
import { IncomingHttpHeaders } from 'http2';

const SALT_ROUNDS = 10;
export const ADMIN_ROLE = 0;
export const EDITOR_ROLE = 1;
export const VIEWER_ROLE = 2;

export class User {
    private sql: DB;

    constructor(db: DB) {
        this.sql = db;
    }

    private hash = async (password: string): Promise<string> => {
        try {
            return await hash(password, SALT_ROUNDS);
        } catch (err) {
            throw err;
        }
    }

    public auth = async (id: string, password: string, level: 0 | 1 | 2 = EDITOR_ROLE): Promise<null | Account> => {
        let result = await this.sql.query('SELECT * FROM `users` WHERE id = ?', [id])
        if (result.length !== 1) return null;
        let user = <Account>result[0];
        try {
            // If compare succeeds than password is correct and return if role is higher than required
            if (await compare(password, user.password) && user.role >= level) return user;
            return null; // if compare fails return false
        } catch (err) {
            throw err;
        }
    }

    public handleAuth = async (headers: IncomingHttpHeaders, level: 0 | 1 | 2 = EDITOR_ROLE): Promise<null | Account> => {
        if (!headers.hasOwnProperty('id') || !headers.hasOwnProperty('password')) return null;
        return await this.auth(headers['id'].toString(), headers['password'].toString(), level);
    }

    public static handleAuthSimple = async (user: Account, level: 0 | 1 | 2 = EDITOR_ROLE): Promise<null | Account> => {
        if (!user || user.role < level) return null;
        return user;
    }



    public createUser = async (name: string, email: string, password: string, role: 0 | 1 | 2): Promise<Account> => {
        try {
            let account = <Account>{ id: uuid(), name: name, email: email, password: await this.hash(password), role: role };
            await this.sql.query('INSERT INTO `users` SET ?', account);
            return account;
        } catch (err) {
            throw err;
        }
    }

    public handleCreateUser = async (req: Request, res: Response): Promise<any> => {
        if (
            !req.body.hasOwnProperty('name') ||
            !req.body.hasOwnProperty('email') ||
            !req.body.hasOwnProperty('password') ||
            !req.body.hasOwnProperty('role')) {
            res.status(400);
            return res.send({ error: 'Missing Parameters' });
        }

        if (!(await User.handleAuthSimple(req.body.user, ADMIN_ROLE))) {
            res.status(403);
            return res.send({ error: 'Authentication Error' })
        }

        try {
            let user = await this.createUser(req.body.name, req.body.email, req.body.password, req.body.role);
            res.send({ user: user });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }



    public updatePassword = async (password: string, id: string): Promise<any> => {
        try {
            await this.sql.query('UPDATE `users` SET `password` = ? WHERE `id` = ?', [await this.hash(password), id]);
        } catch (err) {
            throw err;
        }
    }

    public handleUpdatePassword = async (req: Request, res: Response): Promise<any> => {
        if (!req.body.hasOwnProperty('password')) {
            res.status(400);
            return res.send({ error: 'Missing Parameters' });
        }

        if (!(await User.handleAuthSimple(req.body.user, VIEWER_ROLE))) {
            res.status(403);
            return res.send({ error: 'Authentication Error' })
        }

        try {
            await this.updatePassword(req.body.password, req.body.user.id);
            res.send({ success: true });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }
}

export interface Account {
    id: string
    name: string
    email: string
    password: string
    role: 0 | 1 | 2
}