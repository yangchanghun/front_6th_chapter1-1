import { HomePage } from "./pages/HomePage.js";
import { loadProductData } from "./pages/HomePage.js";
const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function render() {
  loadProductData();
  document.body.querySelector("#root").innerHTML = HomePage();
}

function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
