import { Request, Response } from 'express';
import { DB } from './db';

export class Blog {
    private sql: DB;

    constructor(db: DB) {
        this.sql = db;
    }

    public getBlog = async (id: string): Promise<Post> => {
        let result = (await this.sql.query('SELECT * FROM posts WHERE `id` = ?;', [id]));
        if (result.length !== 1) throw new Error('Post not found');
        return <Post>result[0];
    }

    public handleGetPost = async (req: Request, res: Response): Promise<any> => {
        try {
            let post = await this.getBlog(req.params.id);
            res.send({ post: post });
        } catch (err) {
            res.status(404);
            res.send({ error: err });
        }
    }

    public getBlogList = async (s: number, e: number = 20): Promise<Post[]> => {
        return (<Post[]>await this.sql.query('SELECT * FROM posts ORDER BY `published` DESC;')).slice(s, e);
    }

    public handleGetPosts = async (req: Request, res: Response): Promise<any> => {
        let posts = await this.getBlogList(parseInt(req.params.s), (req.params.e) ? 20 : parseInt(req.params.e));
        res.send({ posts: posts });
    }
}

export interface Post {
    id: string
    title: string
    published: Date
    content: string
    images: Array<string>
}