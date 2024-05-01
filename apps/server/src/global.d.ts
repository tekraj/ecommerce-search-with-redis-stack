declare let global: NodeJS.Global & typeof globalThis;
declare namespace NodeJS {
  type Global = {
    publicDir: string;
  };
}
