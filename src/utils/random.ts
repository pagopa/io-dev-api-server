import { ioDevServerConfig } from "../config";

type RandomValueFunc = <T>(
  defaultValue: T,
  randomValue: T,
  // tslint:disable-next-line:bool-param-default
  randomAllowed?: boolean
) => T;

const getValueGlobalRandomOff: RandomValueFunc = <T>(defaultValue: T) =>
  defaultValue;

const getValueGlobalRandomOn: RandomValueFunc = <T>(
  defaultValue: T,
  randomValue: T,
  randomAllowed: boolean = true
) => (!randomAllowed ? defaultValue : randomValue);

/**
 * if global random (allowRandomValues) is OFF this will be a function that will always return the default value
 * otherwise it will be a function that checks if random is enabled for that specific section (if it is omitted if, random is allowed by default)
 * if the specific random section is enabled then the random value will be returned, the default value otherwise
 */
export const getRandomValue: RandomValueFunc = ioDevServerConfig.allowRandomValues
  ? getValueGlobalRandomOn
  : getValueGlobalRandomOff;
