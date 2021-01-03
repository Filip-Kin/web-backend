import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as cors from 'cors';
import { json, urlencoded } from 'body-parser';
import * as chalk from 'chalk';

import { DB } from './DB';
import { upload } from './Store';
import { Gallery } from './Gallery'
import { Blog } from './Blog';
import { ADMIN_ROLE, EDITOR_ROLE, User, VIEWER_ROLE } from './User';
const { config } = require('../config');

const sql = new DB(config.mysql);
const blog = new Blog(sql);
const gallery = new Gallery(sql);
const user = new User(sql);

const app = express();
const PORT = parseInt(process.env.PORT) || 8000;

app.use(cors());
app.use((req, res, next) => {
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


// Public

app.use(express.static('store'));
app.get('/posts/:s/:e?', (req, res) => blog.handleGetPosts(req, res));
app.get('/post/:id', (req, res) => blog.handleGetPost(req, res));
app.get('/gallery', (req, res) => gallery.handleGetAlbums(req, res));
app.get('/gallery/:id', (req, res) => gallery.handleGetAlbum(req, res));
app.post('/user/login', (req, res) => user.handleLogin(req, res));

app.use(async (req, res, next) => {
    try {
        req.body.user = await user.handleAuth(req.headers, VIEWER_ROLE);
        if (!req.body.user) {
            res.status(401);
            return res.send({ error: 'Authentication Error' })
        }
        next();
    } catch (err) {
        res.status(500);
        return res.send({ error: err });
    }
});

// Viewer permissions

app.post('/user/password', (req, res) => user.handleUpdatePassword(req, res));



app.use(async (req, res, next) => {
    try {
        if (!(await User.handleAuthSimple(req.body.user, EDITOR_ROLE))) {
            res.status(403);
            return res.send({ error: 'Permission Error' })
        }
        next();
    } catch (err) {
        res.status(500);
        return res.send({ error: err });
    }
});

// Editor permissions

app.post('/post/', (req, res) => blog.handleCreatePost(req, res));
app.patch('/post/:id', (req, res) => blog.handleUpdatePost(req, res));
app.delete('/post/:id', (req, res) => blog.handleDeletePost(req, res));

app.post('/gallery', (req, res) => gallery.handleCreateAlbum(req,res));
app.delete('/gallery/:id', (req, res) => gallery.handleDeleteAlbum(req,res));
app.post('/gallery/:id/rename/:name', (req, res) => gallery.handleRenameAlbum(req,res));
app.post('/gallery/:id/weight/:weight', (req, res) => gallery.handleWeightAlbum(req,res));
app.post('/gallery/:id/add/:file', (req, res) => gallery.handleAddToAlbum(req,res));
app.post('/gallery/:id/remove/:file', (req, res) => gallery.handleRemoveFromAlbum(req, res));

app.post('/store/upload', (req, res) => upload(req, res));


app.use(async (req, res, next) => {
    try {
        if (!(await User.handleAuthSimple(req.body.user, ADMIN_ROLE))) {
            res.status(403);
            return res.send({ error: 'Permission Error' })
        }
        next();
    } catch (err) {
        res.status(500);
        return res.send({ error: err });
    }
});

// Admin permissions

app.post('/user/', (req, res) => user.handleCreateUser(req, res));
app.post('/user/:id/resetpassword', (req, res) => user.handleResetPasswordUser(req, res));


app.listen(PORT);
console.log('Production Server running at http://localhost:' + PORT);
