import { Connection, createConnection } from "mysql";

export class DB {
    private conn: Connection;

    constructor(credentials) {
        this.conn = createConnection(credentials);

        this.conn.query('CREATE TABLE IF NOT EXISTS `posts` ( `id` VARCHAR(36) NOT NULL, `title` TEXT NOT NULL, `published` DATETIME NOT NULL, `content` TEXT NOT NULL, `images` JSON NOT NULL, `comments` JSON NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;');
        this.conn.query('CREATE TABLE IF NOT EXISTS `users` ( `id` VARCHAR(36) NOT NULL, `name` VARCHAR(256) NOT NULL, `email` VARCHAR(256) NOT NULL, `password` VARCHAR(60) NOT NULL, `role` INT NOT NULL, `reset_password` BOOLEAN NOT NULL DEFAULT TRUE, PRIMARY KEY (`id`), UNIQUE (`email`)) ENGINE = InnoDB;');
        this.conn.query('CREATE TABLE IF NOT EXISTS `gallery` ( `id` VARCHAR(36) NOT NULL, `name` VARCHAR(256) NOT NULL, `weight` BIGINT NOT NULL,image JSON NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;');

    }

    public query = (sql: string, params: Array<any> | Set = []): Promise<Array<any>> => {
        return new Promise((resolve, reject) => {
            this.conn.query(sql, params, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            })
        });
    }

    public static mysqlDate = (date: Date): string | null => {
        if (date.getTime() !== date.getTime()) return null;
        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    }
    
    public static mysqlTime = (date: Date): string | null => {
        if (date.getTime() !== date.getTime()) return null;
        return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    }
    
    public static mysqlDatetime = (date: Date): string | null => {
        if (date.getTime() !== date.getTime()) return null;
        return DB.mysqlDate(date) + ' ' + DB.mysqlTime(date);
    }
}

interface Set {
    [key: string]: any
}
