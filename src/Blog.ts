import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { DB } from './db';
import { User, EDITOR_ROLE } from './User';

export class Blog {
    private sql: DB;

    constructor(db: DB) {
        this.sql = db;
    }

    public getPost = async (id: string): Promise<Post> => {
        let result = (await this.sql.query('SELECT * FROM posts WHERE `id` = ?;', [id]));
        if (result.length !== 1) throw new Error('Post not found');
        return <Post>result[0];
    }

    public handleGetPost = async (req: Request, res: Response): Promise<any> => {
        try {
            let post = await this.getPost(req.params.id);
            res.send({ post: post });
        } catch (err) {
            res.status(404);
            res.send({ error: err });
        }
    }

    public getPostList = async (s: number, e: number = 20): Promise<Post[]> => {
        return (<Post[]>await this.sql.query('SELECT * FROM posts ORDER BY `published` DESC;')).slice(s, e);
    }

    public handleGetPosts = async (req: Request, res: Response): Promise<any> => {
        let posts = await this.getPostList(parseInt(req.params.s), (req.params.e) ? 20 : parseInt(req.params.e));
        res.send({ posts: posts });
    }



    public createPost = async (title: string, content: string, id: string = null): Promise<Post> => {
        let images = []; // store an array of images seperately so we know what to delete and what to display on the home page
        let m;

        // is there a better way to do this? probably
        for (let i = 0; i < content.length; i) {
            // this will match the next image
            m = (/(?:!\[(.*?)\]\((.*?)\))/g).exec(content.substring(i));
            if (m) {
                // this horrible thing will split the domain from the file name and just get the file name
                images.push(m[2].replace('https://', '').split('/')[1]);
                // and then setup the substring for next iteration
                i += m.index + m[0].length;
            } else break;
        }

        let post: Post;

        if (id) {
            try {
                post = await this.getPost(id);
                post.title = title;
                post.content = content;
                post.images = images;
                await this.sql.query('DELETE FROM `posts` WHERE `id` = ?', [id]);
            } catch (err) {
                throw err;
            }
        } else {
            post = <Post>{
                id: uuid(),
                title: title,
                published: new Date(),
                content: content,
                images: images
            }
        }
        console.log(post);
        let postSql = {
            id: post.id,
            title: title,
            published: post.published.toJSON().slice(0, 19).replace('T', ' '),
            content: content,
            images: JSON.stringify(images)
        }
        await this.sql.query('INSERT INTO `posts` SET ?', postSql);
        return post;
    }

    public handleCreatePost = async (req: Request, res: Response): Promise<any> => {
        if (!req.body.hasOwnProperty('title') ||
            !req.body.hasOwnProperty('content')) {
            res.status(400);
            return res.send({ error: 'Missing Parameters' });
        }

        if (!(await User.handleAuthSimple(req.body.user, EDITOR_ROLE))) {
            res.status(403);
            return res.send({ error: 'Authentication Error' })
        }

        try {
            let post = await this.createPost(req.body.title, req.body.content);
            res.send({ post: post });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }

    public handleUpdatePost = async (req: Request, res: Response): Promise<any> => {
        if (!req.body.hasOwnProperty('title') ||
            !req.body.hasOwnProperty('content')) {
            res.status(400);
            return res.send({ error: 'Missing Parameters' });
        }

        if (!(await User.handleAuthSimple(req.body.user, EDITOR_ROLE))) {
            res.status(403);
            return res.send({ error: 'Authentication Error' })
        }

        try {
            let post = await this.createPost(req.body.title, req.body.content, req.params.id);
            res.send({ post: post });
        } catch (err) {
            res.status(500);
            res.send({ error: err.message });
        }
    }
}

export interface Post {
    id: string
    title: string
    published: Date
    content: string
    images: Array<string>
}