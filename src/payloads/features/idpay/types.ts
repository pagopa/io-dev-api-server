export enum IDPayServiceID {
  DEFAULT = 1,

  INVITED,
  NO_PREREQUISITES,
  PDND_ONLY,
  SELF_ONLY,

  ERR_STATUS_NOT_ELIGIBLE,
  ERR_STATUS_NO_REQUIREMENTS,
  ERR_STATUS_ONBOARDED,
  ERR_STATUS_UNSUBSCRIBED,
  ERR_STATUS_ON_EVALUATION,

  ERR_CHECK_BUDGET_TERMINATED,
  ERR_CHECK_ENDED,
  ERR_CHECK_NOT_STARTED,
  ERR_CHECK_SUSPENDED
}

export enum IDPayInitiativeID {
  DEFAULT = 1,

  INVITED,
  NO_PREREQUISITES,
  PDND_ONLY,
  SELF_ONLY,

  ERR_STATUS_NOT_ELIGIBLE,
  ERR_STATUS_NO_REQUIREMENTS,
  ERR_STATUS_ONBOARDED,
  ERR_STATUS_UNSUBSCRIBED,
  ERR_STATUS_ON_EVALUATION,

  ERR_CHECK_BUDGET_TERMINATED,
  ERR_CHECK_ENDED,
  ERR_CHECK_NOT_STARTED,
  ERR_CHECK_SUSPENDED,

  NOT_CONFIGURED,
  CONFIGURED,
  UNSUBSCRIBED
}
