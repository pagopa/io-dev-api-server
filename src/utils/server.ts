import { networkInterfaces } from "os";
export const serverPort = 3000;
export const serverHostname = "0.0.0.0"; // public
// tslint:disable-next-line: no-let
export let interfaces = Object.create(null);
interfaces = { ...interfaces, loopback: "127.0.0.1" };
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
