import fs from "fs";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Response } from "express";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import { Validation } from "io-ts";

export const sendFileFromRootPath = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

const safeThrowableFunction = <A>(f: () => A) => {
  try {
    return E.right<Error, A>(f());
  } catch (e) {
    return E.left<Error, A>(e as Error);
  }
};

export const readBinaryFileSegment = (
  filename: string,
  length: number
): E.Either<Error, Buffer> =>
  pipe(
    () => fs.openSync(filename, "r"),
    safeThrowableFunction,
    E.chain(fileDescriptor =>
      pipe(
        () => Buffer.alloc(length),
        safeThrowableFunction,
        E.chain(buffer =>
          pipe(
            () => fs.readSync(fileDescriptor, buffer),
            safeThrowableFunction,
            E.chain(byteRead =>
              pipe(
                byteRead > 0,
                B.fold(
                  () =>
                    E.left(
                      new Error(
                        `Unable to read (${length}) bytes from file (${filename})`
                      )
                    ),
                  () => E.right(buffer)
                )
              )
            )
          )
        )
      )
    )
  );

export const isPDFFile = (fileName: string): E.Either<Error, boolean> =>
  pipe(
    readBinaryFileSegment(fileName, 4),
    E.map(buffer =>
      pipe(
        buffer.toString("utf8", 0, buffer.length),
        header => header === "%PDF"
      )
    )
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readFileAsJSON = (fileName: string): any =>
  fs.existsSync(fileName)
    ? JSON.parse(fs.readFileSync(fileName).toString())
    : null;

export const fileExists = (filePath: string) => fs.existsSync(filePath);

export const listDir = (directoryPath: string): string[] => {
  try {
    return fs.readdirSync(directoryPath);
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
export const readFileAndDecode = <T>(
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
