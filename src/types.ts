export interface ExtractedContactDetail {
  type: string;
  value: string;
}

export interface ExtractedDataResult {
  language: string;
  contacts: ExtractedContactDetail[];
}
