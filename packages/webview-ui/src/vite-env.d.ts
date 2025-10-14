/// <reference types="vite/client" />

interface VsCodeApi {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
}

declare function acquireVsCodeApi(): VsCodeApi;

interface Window {
  acquireVsCodeApi(): VsCodeApi;
}
