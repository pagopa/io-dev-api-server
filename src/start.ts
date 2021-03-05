import chalk from "chalk";
import child_process from "child_process";
import { cli } from "cli-ux";
import figlet from "figlet";
import { fromNullable } from "fp-ts/lib/Option";
import { routes } from "./payloads/response";
import app from "./server";
import { readFileAsJSON } from "./utils/file";
import { interfaces, serverHostname, serverPort } from "./utils/server";
// read package.json to print some info
const packageJson = readFileAsJSON("./package.json");

app.listen(serverPort, serverHostname, async () => {
  child_process.exec("git branch --show-current", (err, stdout) => {
    console.log(
      chalk.blue(
        `running on git branch "${chalk.bgRedBright(stdout.replace("\n", ""))}"`
      )
    );

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
      chalk.bgBlue(chalk.white(figlet.textSync(packageJson.pretty_name)))
    );
    console.log(
      chalk.bgBlack(
        chalk.green(
          `\n${packageJson.pretty_name} is running on\n${Object.keys(interfaces)
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
