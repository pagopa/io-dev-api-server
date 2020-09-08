import child_process from "child_process";
import fs from "fs";
import app from "./server";
import { allRegisteredRoutes } from "./payloads/response";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
child_process.exec("git branch --show-current", (err, stdout) => {
  console.log(`running on git branch "${stdout.replace("\n", "")}"`);
});

const serverPort = 3000;
const serverHostname = "0.0.0.0"; // public
app.listen(serverPort, serverHostname, async () => {
  console.log(
    `${packageJson.name} is running on http://${serverHostname}:${serverPort}`
  );
  console.log("these routes are available");
  console.log(allRegisteredRoutes());
});
