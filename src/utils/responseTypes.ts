export type CustomResponse = {
    status: number;
    payload?: object;
  };

export type ResponseProblem<T extends string> = {
    status: number;
    detail: T;
  };