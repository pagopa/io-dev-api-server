import fs from "fs";
import app from "./server";
// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
const serverPort = 3000;
const serverHostname = "0.0.0.0"; // public
app.listen(serverPort, serverHostname, async () => {
  console.log(
    `${packageJson.name} is running on http://${serverHostname}:${serverPort}`
  );
});
