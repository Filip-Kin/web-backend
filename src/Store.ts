import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { existsSync, unlink } from 'fs';
import { join } from 'path';

export const deleteFile = async (file: string): any => {
    if (existsSync(join('./store/', file))) {
        unlink(join('./store/', file), (err) => {
            if (err) throw err;
            return true;
        });
    }
    return false;
}

export const upload = async (req: Request, res: Response): string => {
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
}