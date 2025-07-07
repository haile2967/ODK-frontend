import { accountsRoutes } from "./accountsRoutes.js";
import { generalRoutes } from "./geographyRoutes.js";
import { planningRoutes } from "./planningRoutes.js";
import { reportingRoutes } from "./reportingRoutes.js";
import { dataProcessingRoutes } from "./dataProcessingRoutes.js";


export const allAppRoutes = [
  ...accountsRoutes,
  ...planningRoutes,
  ...generalRoutes,
  ...reportingRoutes,
  ...dataProcessingRoutes,
];
