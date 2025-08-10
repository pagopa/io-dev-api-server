/* eslint-disable functional/immutable-data */
import { createHash } from "crypto";
import { readdirSync, readFileSync } from "fs";
import { cwd } from "process";
import path from "path";
import { Either, left, right } from "fp-ts/lib/Either";
import { Document, DocumentCategory } from "../models/Document";
import { unknownToString } from "../../messages/utils";

export interface IDocumentsRepository {
  documentAtIndex: (index: number) => Either<string, Document>;
  f24AtIndex: (index: number) => Either<string, Document>;
  initializeIfNeeded: () => Either<string, boolean>;
}

const documents = new Array<Document>();
const f24s = new Array<Document>();

const documentAtIndex = (index: number): Either<string, Document> => {
  if (documents.length === 0) {
    return left("There are no documents");
  }
  const safeIndex = index % documents.length;
  return right(documents[safeIndex]);
};

const f24AtIndex = (index: number): Either<string, Document> => {
  if (f24s.length === 0) {
    return left("There are no F24");
  }
  const safeIndex = index % f24s.length;
  return right(f24s[safeIndex]);
};

const initializeIfNeeded = (): Either<string, boolean> => {
  const shouldInitializeDocuments = documents.length === 0;
  const shouldInitializeF24 = f24s.length === 0;

  if (!shouldInitializeDocuments && !shouldInitializeF24) {
    return right(false);
  }

  try {
    const currentWorkingDirectory = cwd();
    const baseAbsolutePath = path.join(
      currentWorkingDirectory,
      "assets",
      "messages",
      "pn"
    );
    if (shouldInitializeDocuments) {
      populateDocumentsFromFolder(
        "DOCUMENT",
        baseAbsolutePath,
        "attachments",
        documents
      );
    }
    if (shouldInitializeF24) {
      populateDocumentsFromFolder("F24", baseAbsolutePath, "f24", f24s);
    }
  } catch (error) {
    const errorMessage = unknownToString(error);
    return left(errorMessage);
  }
  return right(true);
};

const populateDocumentsFromFolder = (
  category: DocumentCategory,
  baseAbsolutePath: string,
  folder: string,
  array: Document[]
): void => {
  const folderAbsolutePath = path.join(baseAbsolutePath, folder);
  const folderFileList = readdirSync(folderAbsolutePath);

  for (const [index, fileNameWithExtension] of folderFileList.entries()) {
    const fileNameWithExtensionAbsolutePath = path.join(
      folderAbsolutePath,
      fileNameWithExtension
    );
    const fileSizeAndSHA256 = getFileSizeAndSHA256(
      fileNameWithExtensionAbsolutePath
    );
    const filename = removeExtension(fileNameWithExtension);
    const document: Document = {
      category,
      contentLength: fileSizeAndSHA256.byteSize,
      contentType: "application/pdf",
      filename,
      index,
      sha256: fileSizeAndSHA256.sha256
    };
    array.push(document);
  }
};

interface CustomFileInfo {
  byteSize: number;
  sha256: string;
}

const getFileSizeAndSHA256 = (filePath: string): CustomFileInfo => {
  const fileBuffer = readFileSync(filePath);

  const byteSize = fileBuffer.byteLength;

  const hash = createHash("sha256");
  hash.update(fileBuffer);
  const sha256 = hash.digest("hex");

  return {
    byteSize,
    sha256
  };
};

const removeExtension = (filename: string): string => {
  // 1. Get the extension, which preserves the original case (e.g., '.PDF')
  const extension = path.extname(filename);

  // 2. Get the basename, removing the case-specific extension
  return path.basename(filename, extension);
};

export const DocumentsRepository: IDocumentsRepository = {
  documentAtIndex,
  f24AtIndex,
  initializeIfNeeded
};
