type settings = {
  messagesNumber: number;
  servicesNumber: number;
  baseNoticeNumber: string;
  serverPort: number;
};

export const settings: settings = {
  messagesNumber: 5,
  servicesNumber: 10,
  baseNoticeNumber: "012345678999999999",
  serverPort: 3000
};

export type paymentItem = {
  idTransaction: number;
  status: string;
};
