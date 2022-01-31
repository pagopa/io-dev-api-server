import { cli } from "cli-ux";
import chalk from "chalk";
import { createIODevServer } from "./server";
import { ioDevServerConfig } from "./config";
import figlet from "figlet";
import { interfaces, serverHostname, serverPort } from "./utils/server";
import { readFileAsJSON } from "./utils/file";
import util from "node:util";
import child_process from "node:child_process";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { flow } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";

const exec = util.promisify(child_process.exec);

const execTE = (cmd: string) =>
  TE.tryCatch(
    () => exec(cmd),
    () => new Error(`unable to execute ${cmd}`)
  );

const getCurrentGitBranch = pipe(
  execTE("git branch --show-current"),
  TE.map(({ stdout: branch, stderr }) => {
    if (stderr.length > 0 || branch.length === 0) {
      return "unknown";
    }
    return branch.trim();
  }),
  TE.fold(() => T.of("unknown"), T.of)
);

const packageJson = readFileAsJSON("./package.json");

const IODevServer = createIODevServer(ioDevServerConfig);

const banner = pipe(
  getCurrentGitBranch,
  T.map(flow(chalk.redBright, chalk.bold)),
  T.map(
    branch => `"${packageJson.pretty_name}" is running on branch ${branch}`
  ),
  T.map(flow(chalk.bgBlack, chalk.white))
);

IODevServer.listen(serverPort, serverHostname, info => {
  banner.run().then(b => {
    cli.table(info.routes, {
      method: {
        minWidth: 6,
        header: "method"
      },
      path: {
        header: "path"
      },
      description: {
        header: "description"
      }
    });
    console.log(
      chalk.bgBlue(chalk.white(figlet.textSync(packageJson.pretty_name)))
    );
    const addrs = interfaces
      .map(
        ({ address }) =>
          `- ${chalk.underline(`http://${address}:${serverPort}`)}`
      )
      .join("\n");
    console.log(b);
    console.log(addrs);
  });
});
