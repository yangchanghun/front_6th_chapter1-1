import { ErrorPage } from "./pages/ErrorPage";
import { HomePage } from "./pages/HomePage";
import { loadProductData } from "./pages/HomePage";
const routes = [{ path: "/", view: HomePage }];

export const render = (currentUrl) => {
  const matchedRoute = routes.find((route) => route.path === currentUrl);
  if (matchedRoute) {
    loadProductData();
    document.body.querySelector("#root").innerHTML = matchedRoute.view();
  } else {
    document.body.querySelector("#root").innerHTML = ErrorPage();
  }
};
