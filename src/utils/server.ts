import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import os from "os";

export const serverPort = 3000;
export const serverHostname = "0.0.0.0"; // public

const interestingNetworkInterfaces = new Set(["en0", "eth0"]);

const getIpv4Addresses = (
  nets: ReadonlyArray<os.NetworkInterfaceInfo>
): ReadonlyArray<os.NetworkInterfaceInfo> =>
  nets.filter(net => net.family !== "IPv4" && !net.internal);

export const interfaces = Object.entries(os.networkInterfaces())
  .filter(([name]) => interestingNetworkInterfaces.has(name))
  .reduce(
    (netInterfaces, [name, nets]) => {
      const addresses = pipe(
        O.fromNullable(nets),
        O.map(getIpv4Addresses),
        O.getOrElse(() => [] as ReadonlyArray<os.NetworkInterfaceInfo>)
      ).map(({ address }) => ({ name, address }));
      return [...netInterfaces, ...addresses];
    },
    [
      {
        name: "loopback",
        address: "127.0.0.1"
      }
    ]
  );

export const serverIpv4Address = interfaces.filter(
  i => i.name !== "loopback"
)[0].address;
