import { Response } from "express";
import fs from "fs";
import { isTestEnv } from "../global";
export const sendFile = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

export const readFileAsJSON = (fileName: string): any =>
  isTestEnv ? {} : JSON.parse(fs.readFileSync(fileName).toString());

export const listDir = (filePath: string): ReadonlyArray<string> => {
  try {
    if (isTestEnv) {
      return [];
    }
    return fs.readdirSync(filePath);
  } catch (e) {
    return [];
  }
};
