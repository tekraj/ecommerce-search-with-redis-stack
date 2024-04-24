/* eslint-disable no-var */
declare var global: NodeJS.Global & typeof globalThis;
declare namespace NodeJS {
  interface Global {
    publicDir: string
  }
}
