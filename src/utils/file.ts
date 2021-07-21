import { Response } from "express";
import fs from "fs";
export const sendFile = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

export const readFileAsJSON = (fileName: string): any =>
  JSON.parse(fs.readFileSync(fileName).toString());

export const listDir = (filePath: string): ReadonlyArray<string> => {
  try {
    return fs.readdirSync(filePath);
  } catch (e) {
    return [];
  }
};
