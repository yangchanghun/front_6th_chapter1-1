// import { cartPage } from "../pages/cartPage";
// import { notFoundPage } from "../pages/notFoundPage";
import { productDetailPage, detailEvent } from "../pages/productDetailPage";
import { bindEvents } from "../pages/productPage";
import { productPage } from "../pages/productPage";
import { notFoundPage } from "../pages/notFoundPage";
import { cartPage } from "../pages/cartPage";

let currentPath = location.pathname;

const routes = [
  { path: "/", view: productPage },
  { path: "/product/:id", view: productDetailPage },
  { path: "/cart", view: cartPage },
];

export async function render() {
  const path = location.pathname;

  // 현재 경로 업데이트
  currentPath = path;

  if (path.startsWith("/product/")) {
    const id = path.split("/product/")[1];
    await productDetailPage(id);
    detailEvent();
    return;
  }

  const route = routes.find((r) => r.path === path);
  if (route) {
    document.querySelector("#root").innerHTML = route.view();
    bindEvents();
  } else {
    document.querySelector("#root").innerHTML = notFoundPage();
  }
}

// 네비게이션 함수 개선
export function navigateToDetail(productId) {
  const newPath = `/product/${productId}`;

  // 현재 경로와 같으면 네비게이션하지 않음
  if (currentPath === newPath) {
    return;
  }

  history.pushState({}, "", newPath);
  render();
}

window.addEventListener("popstate", () => {
  // 브라우저 뒤로가기/앞으로가기 시에만 렌더링
  render();
});
