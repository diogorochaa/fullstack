import { getAppRoutes } from "./actions";
import { createAppRouter } from "./view";

export const router = createAppRouter(getAppRoutes());
