import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import { json, urlencoded } from 'body-parser';
import { v4 as uuid } from 'uuid';
import { createConnection, escape } from 'mysql';
import { create } from 'domain';
import * as chalk from 'chalk';
const { config } = require('../config');

const app = express();
const PORT = parseInt(process.env.PORT) || 8000;
const conn = createConnection(config.mysql);

const query = (sql, params = []): Promise<Array<any>> => {
    return new Promise((resolve, reject) => {
        conn.query(sql, params, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        })
    });
}

conn.query('CREATE TABLE IF NOT EXISTS `posts` ( `id` VARCHAR(36) NOT NULL, `title` TEXT NOT NULL, `published` DATETIME NOT NULL, `content` TEXT NOT NULL, `images` JSON NOT NULL, `comments` JSON NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;');
conn.query('CREATE TABLE IF NOT EXISTS `users` ( `id` VARCHAR(36) NOT NULL, `name` VARCHAR(256) NOT NULL, `email` VARCHAR(256) NOT NULL, `password` VARCHAR(60) NOT NULL, `role` INT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;');

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

app.get('/posts/:n?/:s?', async (req, res) => {
    let posts = <Array<any>>await query('SELECT * FROM posts ORDER BY `published` DESC;');
    if (req.params.n && req.params.s) posts = posts.slice(parseInt(req.params.s), parseInt(req.params.n));
    else if (req.params.n) posts = posts.slice(0, parseInt(req.params.n));
    res.send({ posts: posts });
});

app.get('/post/:id', async (req, res) => {
    res.send({ post: (await query('SELECT * FROM posts WHERE `id` = ?;', [req.params.id]))[0] });
});

app.post('/store/upload', async (req, res) => {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
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
