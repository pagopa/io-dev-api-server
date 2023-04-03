export enum IDPayInitiativeID {
  NO_CONFIGURATION = 1
}

export const getInitiativeId = (id: IDPayInitiativeID) =>
  `TESTINIT${String(id).padStart(2, "0")}`;
