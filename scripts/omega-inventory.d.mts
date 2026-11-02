export type OmegaSourceModule={
 file:string;kind:'style'|'source';lines:number;
 imports:string[];exportedSymbols:string[];functions:string[];
 directlyReferencedByTests:string[];
 possibleConcerns:{numerical:boolean;narratives:boolean;timestamps:boolean;userInterface:boolean};
};
export type OmegaRoute={section:string;dispatchIn:string;handlerSource:string;verifiedAtRuntime:boolean};
export type OmegaInventory={
 schemaVersion:number;repository:string;scope:string;
 counts:{sourceAndStyleModules:number;tests:number;routes:number;modulesWithoutDirectTestImport:number};
 routes:OmegaRoute[];modules:OmegaSourceModule[];testFiles:string[];limitations:string[];
};
export function generateOmegaInventory():OmegaInventory;
