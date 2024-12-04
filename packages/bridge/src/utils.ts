import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

export const createActor = <T>(
  canisterId: string,
  interfaceFactory: IDL.InterfaceFactory
) => {
  const agent = HttpAgent.createSync({
    host: "https://icp0.io/",
  });
  return Actor.createActor<T>(interfaceFactory, {
    canisterId,
    agent,
  });
};
