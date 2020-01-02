import fs from "fs";
import app, { serverPort } from "./server";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());

app.listen(serverPort, async () => {
  console.log(
    `${packageJson.name} is running on http://127.0.0.1:${serverPort}`
  );
});
