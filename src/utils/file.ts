import { Response } from "express";
import fs from "fs";
export const sendFile = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

export const listDir = (filePath: string) => {
  return fs.readdirSync(filePath);
};
