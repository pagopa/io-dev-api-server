import chalk from "chalk";
import child_process from "child_process";
import { cli } from "cli-ux";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import { networkInterfaces } from "os";
import { routes } from "./payloads/response";
import app from "./server";
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
      },
      description: {
        header: "description",
        get(row): any {
          return (
            fromNullable(row.description)
              // tslint:disable-next-line:no-nested-template-literals
              .map(d => `(${d})`)
              .getOrElse("")
          );
        }
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
});
