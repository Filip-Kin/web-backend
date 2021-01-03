import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import { json, urlencoded } from 'body-parser';
import { v4 as uuid } from 'uuid';
import * as chalk from 'chalk';

import { DB } from './DB';
import {Gallery} from './Gallery'
import { Blog } from './Blog';
import { User } from './User';
const { config } = require('../config');

const sql = new DB(config.mysql);
const blog = new Blog(sql);
const gallery = new Gallery(sql);
const user = new User(sql);

const app = express();
const PORT = parseInt(process.env.PORT) || 8000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    console.log(chalk.bold(`[${(new Date()).toISOString()}] `) + req.ip + ' Requesting: ' + chalk.bold.green(req.url));
    next();
});

app.use(fileUpload({
    createParentPath: true
}));
app.use(json());
app.use(urlencoded({ extended: true }));

app.post('/restartapp', (req, res) => {
    if (req.body.repository.id === 326067272) {
    	res.send(true);
        process.exit();
    } else {
        res.status(403)
        res.send(false);
    }
});


app.get('/posts/:s/:e?', (req, res) => blog.handleGetPosts(req, res));
app.get('/post/:id', (req, res) => blog.handleGetPost(req, res));
app.get('/gallery/:id',(req, res) => {})
app.post('/gallery', (req, res) => gallery.handleCreateAlbum(req,res));
app.post('/user/login', (req, res) => user.handleLogin(req, res));


app.use(async (req, res, next) => {
    req.body.user = await user.handleAuth(req.headers);
    next();
});


app.post('/user/', (req, res) => user.handleCreateUser(req, res));
app.post('/user/password', (req, res) => user.handleUpdatePassword(req, res));


app.post('/post/', (req, res) => blog.handleCreatePost(req, res));
app.patch('/post/:id', (req, res) => blog.handleUpdatePost(req, res));

app.post('/store/upload', async (req, res) => {
    try {
        // @ts-ignore
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            // @ts-ignore
            let image = req.files.image;
            let id = uuid() + '.' + image.name.split('.').pop();

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            image.mv('./store/' + id);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                id: id
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.use(express.static('store'));

app.listen(PORT);
console.log('Production Server running at http://localhost:' + PORT);
