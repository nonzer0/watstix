// Minimal declarations for the Deno globals our edge functions use, so they
// can be type-checked by the project's Node-based `tsc` (tsconfig.functions.json)
// without installing Deno locally. Lives outside each function's directory,
// so it is never bundled on deploy. Extend as functions use more of Deno.
declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};
