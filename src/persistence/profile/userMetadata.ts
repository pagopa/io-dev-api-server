import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Request } from "express";
import { UserDataProcessing } from "../../../generated/definitions/backend/UserDataProcessing";
import {
  UserDataProcessingChoice,
  UserDataProcessingChoiceEnum
} from "../../../generated/definitions/backend/UserDataProcessingChoice";
import { CustomResponse, ResponseProblem } from "../../utils/responseTypes";
import { getProblemJson } from "../../payloads/error";
import { validatePayload } from "../../utils/validator";
import { UserDataProcessingChoiceRequest } from "../../../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessingStatusEnum } from "../../../generated/definitions/backend/UserDataProcessingStatus";

const initialUserChoice: UserDeleteDownloadData = {
  DOWNLOAD: undefined,
  DELETE: undefined
};

// eslint-disable-next-line functional/no-let
let userChoices = initialUserChoice;

export const getUserChoice = (
  req: Request
): UserMetadataOperationsType["get"] => {
  const choice = req.params.choice as UserDataProcessingChoiceEnum;
  if (userChoices[choice] === undefined) {
    return {
      status: userMetadataProblemsList.userChoiceUndefinedForPost.status,
      payload: getProblemJson(
        userMetadataProblemsList.userChoiceUndefinedForPost.status
      )
    };
  }

  return {
    status: userMetadataSuccessOperations.get.status,
    payload: userChoices[choice]
  };
};

export const userDataProcessingUpdate = (
  req: Request
): UserMetadataOperationsType["post"] => {
  const payload = validatePayload(UserDataProcessingChoiceRequest, req.body);
  const choice = payload.choice;

  if (
    userChoices[choice] !== undefined &&
    userChoices[choice]?.status !== UserDataProcessingStatusEnum.ABORTED
  ) {
    return {
      status: 200,
      payload: userChoices[choice]
    };
  }
  const data: UserDataProcessing = {
    choice,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 1
  };
  userChoices = {
    DOWNLOAD: choice === "DOWNLOAD" ? data : userChoices.DOWNLOAD,
    DELETE: choice === "DELETE" ? data : userChoices.DELETE
  };
  return {
    status: 200,
    payload: userChoices[choice]
  };
};

export const userDataProcessingDelete = (
  req: Request
): UserMetadataOperationsType["pending" | "deleteData" | "deleteDownload"] => {
  const maybeChoice = UserDataProcessingChoice.decode(req.params.choice);

  if (E.isLeft(maybeChoice)) {
    // the given param is not a valid UserDataProcessingChoice
    // send invalid request
    return {
      status: userMetadataProblemsList.userChoiceUndefinedForDelete.status
    };
  }
  const choice = maybeChoice.right;
  // The abort function is managed only for the DELETE
  if (choice === UserDataProcessingChoiceEnum.DOWNLOAD) {
    return {
      status: userMetadataSuccessOperations.deleteDownload.status
    };
  }

  const acceptedOrConflictStatus = pipe(
    userChoices[choice],
    O.fromNullable,
    O.fold(
      () => userMetadataSuccessOperations.deleteData.status,
      c =>
        c.status !== UserDataProcessingStatusEnum.PENDING
          ? userMetadataSuccessOperations.deleteData.status
          : userMetadataSuccessOperations.pending.status
    )
  );

  if (
    acceptedOrConflictStatus === userMetadataSuccessOperations.pending.status
  ) {
    const data: UserDataProcessing = {
      choice,
      status: UserDataProcessingStatusEnum.ABORTED,
      version: 1
    };
    userChoices = {
      DOWNLOAD: userChoices.DOWNLOAD,
      DELETE: data
    };
  }

  return {
    status: acceptedOrConflictStatus
  };
};

export const resetUserChoice = () => (userChoices = initialUserChoice);

// define user UserDataProcessing (download / delete)
// to handle and remember user choice
type UserDeleteDownloadData = {
  [key in keyof typeof UserDataProcessingChoiceEnum]:
    | UserDataProcessing
    | undefined;
};

// MARK: Problems
type UserMetadataProblemDetail = "User choice undefined";

type UserMetadataProblems = {
  userChoiceUndefinedForPost: ResponseProblem<UserMetadataProblemDetail>;
  userChoiceUndefinedForDelete: ResponseProblem<UserMetadataProblemDetail>;
};

const userMetadataProblemsList: UserMetadataProblems = {
  userChoiceUndefinedForPost: {
    status: 404,
    detail: "User choice undefined"
  },
  userChoiceUndefinedForDelete: {
    status: 400,
    detail: "User choice undefined"
  }
};

// MARK: Response

type UserMetadataOperationsType = {
  get: CustomResponse;
  post: CustomResponse;
  deleteDownload: CustomResponse;
  pending: CustomResponse;
  deleteData: CustomResponse;
};

const userMetadataSuccessOperations: UserMetadataOperationsType = {
  get: {
    status: 200,
    payload: UserDataProcessing
  },
  post: {
    status: 200,
    payload: UserDataProcessing
  },
  deleteDownload: {
    status: 409
  },
  pending: {
    status: 202
  },
  deleteData: {
    status: 409
  }
};
