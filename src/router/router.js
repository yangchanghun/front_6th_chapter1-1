import { ErrorPage } from "../pages/ErrorPage";
import { HomePage } from "../pages/HomePage";
import { loadProductData } from "../pages/HomePage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
const routes = [
  { path: "/", view: HomePage },
  { path: "/detail", view: ProductDetailPage },
];

export const render = (currentUrl) => {
  const matchedRoute = routes.find((route) => route.path === currentUrl);
  if (matchedRoute.path === "/") {
    loadProductData();
    document.body.querySelector("#root").innerHTML = matchedRoute.view();
  } else {
    document.body.querySelector("#root").innerHTML = ErrorPage();
  }
};
