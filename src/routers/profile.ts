import * as E from "fp-ts/lib/Either";
import { Lazy } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { Profile } from "../../generated/definitions/backend/Profile";
import { UserDataProcessing } from "../../generated/definitions/backend/UserDataProcessing";
import {
  UserDataProcessingChoice,
  UserDataProcessingChoiceEnum
} from "../../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingChoiceRequest } from "../../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessingStatusEnum } from "../../generated/definitions/backend/UserDataProcessingStatus";
import { Plugin } from "../core/server";
import { getProblemJson } from "../payloads/error";
import { currentProfile as profile } from "../payloads/profile";

import { mockUserMetadata } from "../payloads/userMetadata";
import { addApiV1Prefix } from "../utils/strings";
import { validatePayload } from "../utils/validator";

import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { PreferredLanguages } from "../../generated/definitions/backend/PreferredLanguages";

// tslint:disable-next-line: no-let
export let currentProfile: InitializedProfile;
// define user UserDataProcessing (download / delete)
// to handle and remember user choice
type UserDeleteDownloadData = {
  [key in keyof typeof UserDataProcessingChoiceEnum]:
    | UserDataProcessing
    | undefined;
};
const initialUserChoice: UserDeleteDownloadData = {
  DOWNLOAD: undefined,
  DELETE: undefined
};
// tslint:disable-next-line: no-let
let userChoices = initialUserChoice;

// reset function
export let resetProfile: Lazy<void>;

export const ProfileFiscalCodeAttr = t.interface({
  profile: t.interface({
    attrs: t.interface({
      fiscal_code: FiscalCode
    })
  })
});

export type ProfileFiscalCodeAttr = t.TypeOf<typeof ProfileFiscalCodeAttr>;

export const ProfilePluginOptions = t.intersection([
  ProfileFiscalCodeAttr,
  t.interface({
    profile: t.interface({
      attrs: t.interface({
        name: t.string,
        fiscal_code: FiscalCode,
        family_name: t.string,
        mobile: NonEmptyString,
        email: EmailAddress,
        accepted_tos_version: NonNegativeNumber,
        preferred_languages: PreferredLanguages
      }),
      authenticationProvider: t.union([t.literal("spid"), t.literal("cie")]),
      firstOnboarding: t.boolean
    })
  })
]);

export type ProfilePluginOptions = t.TypeOf<typeof ProfilePluginOptions>;

export const ProfilePlugin: Plugin<ProfilePluginOptions> = async (
  { handleRoute },
  options
) => {
  currentProfile = profile(options.profile);

  resetProfile = () => {
    userChoices = initialUserChoice;
    currentProfile = profile(options.profile);
  };

  // update installationID (useful information to target device using push notification)
  handleRoute(
    "put",
    addApiV1Prefix("/installations/:installationID"),
    (_, res) => res.json({ message: "OK" })
  );

  // get profile
  handleRoute("get", addApiV1Prefix("/profile"), (_, res) =>
    res.json(currentProfile)
  );

  // update profile
  handleRoute("post", addApiV1Prefix("/profile"), (req, res) => {
    const maybeProfileToUpdate = Profile.decode(req.body);
    if (E.isLeft(maybeProfileToUpdate)) {
      res.sendStatus(400);
      return;
    }
    // profile is merged with the one coming from request.
    // furthermore this profile's version is increased by 1
    const clientProfileIncreased: Profile = {
      ...maybeProfileToUpdate.value,
      version: parseInt(req.body.version, 10) + 1
    };
    currentProfile = {
      ...currentProfile,
      ...clientProfileIncreased,
      is_inbox_enabled: (clientProfileIncreased.accepted_tos_version ?? 0) > 0
    };
    res.json(currentProfile);
  });

  // User metadata
  handleRoute("get", addApiV1Prefix("/user-metadata"), (_, res) =>
    res.json({ ...mockUserMetadata, version: currentProfile.version })
  );

  handleRoute("post", addApiV1Prefix("/user-metadata"), (req, res) => {
    res.json(req.body);
  });

  // User data processing (DOWNLOAD / DELETE)
  handleRoute(
    "get",
    addApiV1Prefix("/user-data-processing/:choice"),
    (req, res) => {
      const choice = req.params.choice as UserDataProcessingChoiceEnum;
      if (userChoices[choice] === undefined) {
        res.status(404).json(getProblemJson(404));
        return;
      }
      res.json(userChoices[choice]);
    }
  );

  handleRoute("post", addApiV1Prefix("/user-data-processing"), (req, res) => {
    const payload = validatePayload(UserDataProcessingChoiceRequest, req.body);
    const choice = payload.choice;
    if (
      userChoices[choice] !== undefined &&
      userChoices[choice]?.status !== UserDataProcessingStatusEnum.ABORTED
    ) {
      return { payload: userChoices[choice] };
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
    res.json(userChoices[choice]);
  });

  handleRoute(
    "delete",
    addApiV1Prefix("/user-data-processing/:choice"),
    (req, res) => {
      // try to decode the request param

      const maybeChoice = UserDataProcessingChoice.decode(req.params.choice);

      if (E.isLeft(maybeChoice)) {
        // the given param is not a valid UserDataProcessingChoice
        // send invalid request
        res.sendStatus(400);
        return;
      }

      const choice = maybeChoice.value;
      // The abort function is managed only for the DELETE
      if (choice === UserDataProcessingChoiceEnum.DOWNLOAD) {
        res.sendStatus(409);
        return;
      }

      const acceptedOrConflictStatus = pipe(
        O.fromNullable(userChoices[choice]),
        O.fold(
          () => 409,
          c => (c.status !== UserDataProcessingStatusEnum.PENDING ? 409 : 202)
        )
      );
      res.sendStatus(acceptedOrConflictStatus);

      if (acceptedOrConflictStatus === 202) {
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
    }
  );

  // Email validation
  // return positive feedback on request to receive a new email message to verify his/her email
  handleRoute("post", addApiV1Prefix("/email-validation-process"), (_, res) => {
    res.sendStatus(202);
  });
};
