import chalk from "chalk";
import child_process from "child_process";
import fs from "fs";
import { networkInterfaces } from "os";
import { allRegisteredRoutes, routes } from "./payloads/response";
import app from "./server";
import { cli } from "cli-ux";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());

export const serverPort = 3000;
const serverHostname = "0.0.0.0"; // public
// tslint:disable-next-line: no-let
export let interfaces = Object.create(null);
interfaces = { ...interfaces, loopback: "127.0.0.1" };
app.listen(serverPort, serverHostname, async () => {
  child_process.exec("git branch --show-current", (err, stdout) => {
    console.log(
      chalk.blue(
        `running on git branch "${chalk.bgRedBright(stdout.replace("\n", ""))}"`
      )
    );
    const nets = networkInterfaces();

    const interestingNetworkInterfaces = new Set(["en0", "eth0"]);
    for (const name of Object.keys(nets)) {
      if (!interestingNetworkInterfaces.has(name)) {
        continue;
      }
      for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === "IPv4" && !net.internal) {
          if (interfaces[name]) {
            continue;
          }
          interfaces = { ...interfaces, name: net.address };
        }
      }
    }
    cli.table([...routes], {
      method: {
        minWidth: 6,
        header: "method"
      },
      path: {
        header: "path"
      }
    });
    console.log(
      chalk.bgBlack(
        chalk.green(
          `\n${packageJson.name} is running on\n${Object.keys(interfaces)
            .map(
              ni =>
                // tslint:disable-next-line:no-nested-template-literals
                `- ${chalk.underline(`http://${interfaces[ni]}:${serverPort}`)}`
            )
            .join("\n")}`
        )
      )
    );
  });

  console.log("routes available:");
  console.log(chalk.bgBlue(allRegisteredRoutes()));
  console.log("\n");
});
