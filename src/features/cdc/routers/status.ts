import { addCdcHandler } from "../utils";
import { getCdcStatus } from "../services/statusService";
import { handleLeftEitherIfNeeded } from "../../../utils/error";

addCdcHandler("get", "/status", (req, res) => {
  const statusEither = getCdcStatus();
  if (handleLeftEitherIfNeeded(statusEither, res)) {
    return;
  }
  res.status(200).json(statusEither.right);
});
