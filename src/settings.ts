type settings = {
  user: string;
  userCf: string;
  messagesNumber: number;
  servicesNumber: number;
  baseNoticeNumber: string;
  serverPort: number;
};

export const settings: settings = {
  user: "mario",
  userCf: "RSSMRA83A12H501D",
  messagesNumber: 20,
  servicesNumber: 10,
  baseNoticeNumber: "012345678999999999",
  serverPort: 3000
};

export type paymentItem = {
  idTransaction: number;
  status: string;
};
