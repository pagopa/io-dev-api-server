export type DocumentCategory = "DOCUMENT" | "F24" | "PAGOPA";

export interface Document {
  availableFrom?: Date;
  availableUntil?: Date;
  category: DocumentCategory;
  contentLength: number; // byte
  contentType: string;
  filename: string;
  index: number;
  sha256: string;
}
