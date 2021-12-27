import os from "os";
import * as O from "fp-ts/lib/Option";

export const serverPort = 3000;
export const serverHostname = "0.0.0.0"; // public

const interestingNetworkInterfaces = new Set(["en0", "eth0"]);

const getIpv4Addresses = (nets: O.Option<os.NetworkInterfaceInfo[]>) =>
  nets.foldL(
    () => [],
    nets => nets.filter(net => net.family === "IPv4" && !net.internal)
  );

export const interfaces = Object.entries(os.networkInterfaces())
  .filter(([name]) => interestingNetworkInterfaces.has(name))
  .reduce(
    (interfaces, [name, nets]) => {
      const addresses = getIpv4Addresses(
        O.fromNullable(nets)
      ).map(({ address }) => ({ name, address }));
      return [...interfaces, ...addresses];
    },
    [
      {
        name: "loopback",
        address: "127.0.0.1"
      }
    ]
  );

export const serverIpv4Address = interfaces.filter(i => i.name !== "loopback")[0].address;
