import { createContext, Dispatch, SetStateAction } from "react";

export enum Route {
  Home,
  TaskCreation,
  Convertor,
}

export const routeContext = createContext<[Route, Dispatch<SetStateAction<Route>>]>(null);
