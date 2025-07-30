/* eslint-disable functional/no-let */
import { createHash } from "crypto";
import { createReadStream } from "fs";
import { readdir } from "fs/promises";
import { cwd } from "process";
import path from "path";
import { Either, left, right } from "fp-ts/lib/Either";
import { Document, DocumentCategory } from "../models/Document";

const documents = new Map<string, Document>();

export const initializeIfNeeded = async (): Promise<
  Either<string, boolean>
> => {
  if (documents.size > 0) {
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
    await populateDocumentsFromFolder(
      "DOCUMENT",
      baseAbsolutePath,
      "attachments",
      documents
    );
    await populateDocumentsFromFolder(
      "F24",
      baseAbsolutePath,
      "f24",
      documents
    );
  } catch (error) {
    const errorMessage = unknownToString(error);
    return left(errorMessage);
  }
  return right(true);
};

const populateDocumentsFromFolder = async (
  category: DocumentCategory,
  baseAbsolutePath: string,
  folder: string,
  map: Map<string, Document>
): Promise<void> => {
  const folderAbsolutePath = path.join(baseAbsolutePath, folder);
  const folderFileList = await readdir(folderAbsolutePath);

  for (const [index, fileNameWithExtension] of folderFileList.entries()) {
    const fileNameWithExtensionAbsolutePath = path.join(
      folderAbsolutePath,
      fileNameWithExtension
    );
    const fileSizeAndSHA256 = await getFileSizeAndSHA256(
      fileNameWithExtensionAbsolutePath
    );
    const filename = removeExtension(fileNameWithExtension);
    const documentId = getDocumentId(category, index);
    const document: Document = {
      category,
      contentLength: fileSizeAndSHA256.byteSize,
      contentType: "application/pdf",
      filename,
      index,
      sha256: fileSizeAndSHA256.sha256
    };
    map.set(documentId, document);
  }
};

interface CustomFileInfo {
  byteSize: number;
  sha256: string;
}

const getFileSizeAndSHA256 = async (
  filePath: string
): Promise<CustomFileInfo> => {
  const hash = createHash("sha256");

  const stream = createReadStream(filePath);
  let totalSize: number = 0;

  for await (const chunkAny of stream) {
    const typedChunk: Buffer = chunkAny;
    hash.update(typedChunk);
    totalSize += typedChunk.length;
  }

  return {
    byteSize: totalSize,
    sha256: hash.digest("hex")
  };
};

const removeExtension = (filename: string): string => {
  // 1. Get the extension, which preserves the original case (e.g., '.PDF')
  const extension = path.extname(filename);

  // 2. Get the basename, removing the case-specific extension
  return path.basename(filename, extension);
};

const getDocumentId = (category: DocumentCategory, index: number) =>
  `${category}_${index}`;

const unknownToString = (input: unknown): string => {
  // 1. Handle null and undefined explicitly for consistent output
  if (input === null) {
    return "Null";
  }
  if (input === undefined) {
    return "Undefined";
  }

  // 2. Handle Error instances to get the core message
  if (input instanceof Error) {
    return input.message;
  }

  // 3. For other objects (including arrays), use JSON.stringify
  if (typeof input === "object") {
    try {
      // This is far more informative than '[object Object]'
      return JSON.stringify(input);
    } catch {
      // This handles errors like circular references
      return "Unserializable Object";
    }
  }

  // 4. Fallback for primitives (string, number, boolean, etc.)
  return String(input);
};
