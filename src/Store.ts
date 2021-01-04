import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { existsSync, unlink } from 'fs';
import { join } from 'path';

export const deleteFile = async (file: string): Promise<any> => {
    if (existsSync(join('./store/', file))) {
        unlink(join('./store/', file), (err) => {
            if (err) throw err;
            return true;
        });
    }
    return false;
}

export const deleteFiles = async (files: string[]): Promise<any> => {
    for (let file of files) await deleteFile(file);
}

export const handleDeleteFiles = async (req: Request, res: Response): Promise<any> => {
    if (!req.body.hasOwnProperty('images')) {
        res.status(400);
        return res.send({ error: 'Missing Parameters' });
    }

    try {
        await deleteFiles(req.body.images);
        res.send({ success: true });
    } catch (err) {
        res.status(500);
        res.send({ error: err.message });
    }
}

export const upload = async (req: Request, res: Response): Promise<any> => {
  try {
      // @ts-ignore
      if (!req.files) {
          res.status(400);
          res.send({
              error: 'No file uploaded'
          });
      } else {
          // @ts-ignore
          let image = req.files.image;
          let id = uuid() + '.' + image.name.split('.').pop();

          //Use the mv() method to place the file in upload directory (i.e. "uploads")
          image.mv('./store/' + id);

          //send response
          res.send({
              id: id
          });
      }
  } catch (err) {
      res.status(500).send({ error: err });
  }
}
