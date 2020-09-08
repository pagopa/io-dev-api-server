import child_process from "child_process";
import fs from "fs";
import app from "./server";
import { allRegisteredRoutes } from "./payloads/response";
import chalk from "chalk";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());

const serverPort = 3000;
const serverHostname = "0.0.0.0"; // public
app.listen(serverPort, serverHostname, async () => {
  child_process.exec("git branch --show-current", (err, stdout) => {
    console.log(
      chalk.blue(`running on git branch "${stdout.replace("\n", "")}"`)
    );
  });
  console.log(
    chalk.green(
      `${packageJson.name} is running on http://${serverHostname}:${serverPort}\n`
    )
  );
  console.log("routes available:");
  console.log(chalk.bgBlue(allRegisteredRoutes()));
});
