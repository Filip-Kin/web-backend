import { Connection, createConnection } from "mysql";

export class DB {
    private conn: Connection;

    constructor(credentials) {
        this.conn = createConnection(credentials);

        this.conn.query('CREATE TABLE IF NOT EXISTS `posts` ( `id` VARCHAR(36) NOT NULL, `title` TEXT NOT NULL, `published` DATETIME NOT NULL, `content` TEXT NOT NULL, `images` JSON NOT NULL, `comments` JSON NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;');
        this.conn.query('CREATE TABLE IF NOT EXISTS `users` ( `id` VARCHAR(36) NOT NULL, `name` VARCHAR(256) NOT NULL, `email` VARCHAR(256) NOT NULL, `password` VARCHAR(60) NOT NULL, `role` INT NOT NULL, PRIMARY KEY (`id`), UNIQUE (`email`)) ENGINE = InnoDB;');
    }

    public query = (sql: string, params: Array<any> | Set = []): Promise<Array<any>> => {
        return new Promise((resolve, reject) => {
            this.conn.query(sql, params, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            })
        });
    }
}

interface Set {
    [key: string]: any
}
