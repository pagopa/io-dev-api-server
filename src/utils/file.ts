import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Response } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import fs from "fs";
import { Validation } from "io-ts";

export const sendFile = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

export const readFileAsJSON = (fileName: string): any =>
  fs.existsSync(fileName)
    ? JSON.parse(fs.readFileSync(fileName).toString())
    : null;

export const fileExists = (filePath: string) => fs.existsSync(filePath);

export const listDir = (filePath: string): ReadonlyArray<string> => {
  try {
    return fs.readdirSync(filePath);
  } catch (e) {
    return [];
  }
};

/**
 * Read a file, try to decode and transform the result in a response
 * @param filename
 * @param decode
 * @param res
 */
export const readFileAndDecode = <I, T>(
  filename: string,
  decode: (i: T) => Validation<T>,
  res: Response
): Response =>
  pipe(
    readFileAsJSON(filename),
    decode,
    E.fold(
      errors => res.status(500).send(readableReport(errors)),
      v => res.json(v)
    )
  );

export const contentTypeMapping: Record<string, string> = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  jpg: "image/jpg",
  png: "image/png",
  zip: "application/zip"
};
