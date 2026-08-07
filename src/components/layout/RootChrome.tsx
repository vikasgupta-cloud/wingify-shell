import { Outlet } from "react-router-dom";
import FontController from "./FontController";

/**
 * Top-level chrome shared by every route. Keeps FontController inside the
 * router so links (e.g. chart gallery) can use React Router APIs.
 */
export default function RootChrome() {
  return (
    <>
      <Outlet />
      <FontController />
    </>
  );
}
