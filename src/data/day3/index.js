import { appRouter } from "./app-router";
import { fileRouting } from "./file-routing";
import { ssrSsgIsr } from "./ssr-ssg-isr";
import { serverClient } from "./server-client";
import { dataFetching } from "./data-fetching";
import { serverActions } from "./server-actions";
import { middlewareTopic } from "./middleware";
import { layoutsMetadata } from "./layouts-metadata";
import { nextjsAuth } from "./nextjs-auth";

export const day3Topics = {
  "app-router": appRouter,
  "file-routing": fileRouting,
  "ssr-ssg-isr": ssrSsgIsr,
  "server-client": serverClient,
  "data-fetching": dataFetching,
  "server-actions": serverActions,
  middleware: middlewareTopic,
  "layouts-metadata": layoutsMetadata,
  "nextjs-auth": nextjsAuth,
};
