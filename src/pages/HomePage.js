// HomePage.js
import { getCategories, getProducts } from "../api/productApi";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { ProductFilter } from "../components/ProductFilter";
import { ProductSkelleton } from "../components/ProductSkelleton";
import { Footer } from "../components/Footer";
import { productState } from "../store/productState";
import { cartState, saveCartToStorage } from "../store/cartState";
// 상품fetch
import { loadCartFromStorage } from "../store/cartState";
import { updateCartIcon } from "../components/Header.js";
import { CartAddToast } from "../components/Toast.js";
export async function loadProductData() {
  productState.loading = true;

  // 장바구니 개수호출;;;
  loadCartFromStorage();
  const [
    {
      products,
      pagination: { total },
    },
    categories,
  ] = await Promise.all([
    getProducts({
      limit: productState.filters.limit,
      sort: productState.filters.sort,
      search: productState.filters.search,
      category1: productState.filters.category1,
      category2: productState.filters.category2,
    }),
    getCategories(),
  ]);

  // state추가해주고 다시 로드
  productState.products = products || [];
  productState.categories = categories || [];
  productState.total = total || 0;
  productState.loading = false;
  renderPage();
}

function renderPage() {
  const rootElement = document.body.querySelector("#root");
  if (rootElement) {
    rootElement.innerHTML = HomePage();
    bindEvents();
  }
}

// 이벤트 달아주기
function bindEvents() {
  const limitSelect = document.querySelector("#limit-select");
  const sortSelect = document.querySelector("#sort-select");
  const inputSelect = document.querySelector("#search-input");
  const category1Buttons = document.querySelectorAll(".category1-filter-btn");
  const category2Buttons = document.querySelectorAll(".category2-filter-btn");
  const cartAddButtons = document.querySelectorAll(".add-to-cart-btn");
  const breadcrumbButtons = document.querySelectorAll("[data-breadcrumb]");

  cartAddButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.target.dataset.productId;
      const product = productState.products.find((p) => p.productId === productId);

      if (!product) {
        console.error("상품 정보 없음", productId);
        return;
      }

      // 이미 담겨있는지 확인
      const existing = cartState.items.find((item) => item.product.productId === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cartState.items.push({ product, quantity: 1 });
      }

      saveCartToStorage();
      updateCartIcon(); // 장바구니 개수 UI 갱신
      const toast = document.getElementById("cart-toast");
      toast.style.display = "block";

      setTimeout(() => {
        toast.style.display = "none";
      }, 1500);
    });
  });
  // 브레드크럼
  breadcrumbButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const type = e.target.dataset.breadcrumb;

      if (type === "reset") {
        // 전체 버튼 클릭 시
        productState.filters.category1 = "";
        productState.filters.category2 = "";
      } else if (type === "category1") {
        // 1차 카테고리만 초기화
        const category1 = e.target.dataset.category1;
        productState.filters.category1 = category1;
        productState.filters.category2 = "";
      }

      productState.page = 1;
      loadProductData();
    });
  });

  category2Buttons.forEach((btn) => {
    btn.addEventListener("click", handleCategory2);
  });

  category1Buttons.forEach((btn) => {
    btn.addEventListener("click", handleCategory1);
  });

  if (limitSelect) {
    limitSelect.removeEventListener("change", limitChange);
    limitSelect.addEventListener("change", limitChange);
  }

  if (sortSelect) {
    sortSelect.removeEventListener("change", sortChange);
    sortSelect.addEventListener("change", sortChange);
  }

  if (inputSelect) {
    inputSelect.removeEventListener("keydown", handleSearchInput);
    inputSelect.addEventListener("keydown", handleSearchInput);
  }

  window.removeEventListener("scroll", handleScroll);
  window.addEventListener("scroll", handleScroll);
}

async function handleCategory2(e) {
  const category2 = e.target.dataset.category2;
  console.log(category2);
  productState.filters.search = "";
  productState.filters.category2 = category2;
  productState.page = 1;
  loadProductData();
}

async function handleCategory1(e) {
  const category1 = e.target.dataset.category1;
  console.log(category1);
  productState.filters.search = "";
  productState.filters.category1 = category1;
  productState.filters.category2 = ""; // category2 초기화
  productState.page = 1;

  loadProductData();
}

// 검색
async function handleSearchInput(e) {
  if (e.key === "Enter") {
    const keyword = e.target.value.trim();
    if (!keyword) return;

    productState.filters.search = keyword;
    productState.page = 1;
    productState.products = []; // 기존 결과 초기화
    productState.hasMore = true;

    await loadProductData(); //  데이터 다 받은 뒤 아래 실행

    console.log("total:", productState.total);
    console.log("products.length:", productState.products.length);
    console.log("hasMore:", productState.hasMore);

    productState.hasMore = productState.products.length < productState.total;
  }
}
async function handleScroll() {
  // 상품 더이상 출력할거 없으면 스탑
  if (productState.loading || !productState.hasMore) {
    return;
  }
  // 상품로드전 전체 높이
  const documentHeight = document.body.offsetHeight;

  // 화면에 보이는높이
  const windowHeight = window.innerHeight;

  // 스크롤하는 길이
  const scrollY = window.scrollY;

  if (windowHeight + scrollY >= documentHeight - 100) {
    console.log("다음 상품출력");
    const indicator = document.getElementById("scroll-loading-indicator");
    if (indicator) indicator.style.display = "block";
    productState.loading = true;
    productState.page += 1;

    const res = await getProducts({
      limit: productState.filters.limit,
      sort: productState.filters.sort,
      search: productState.filters.search,
      category1: productState.filters.category1,
      category2: productState.filters.category2,
      page: productState.page,
    });
    const newProducts = res.products;
    // 기존 상품 + 추가 상품
    productState.hasMore = res?.pagination?.hasNext;

    productState.products = [...productState.products, ...newProducts];
    productState.loading = false;
    //  loadProductData(); // 상품 데이터 다시 불러오기
    renderPage();
    setTimeout(() => {
      const indicator = document.getElementById("scroll-loading-indicator");
      if (indicator) indicator.style.display = "none";
    }, 500);
  }
}

// limit변경함수
function limitChange(e) {
  productState.filters.limit = parseInt(e.target.value, 10);
  loadProductData(); // 상품 데이터 다시 불러오기
}

// sort변경함수
function sortChange(e) {
  productState.filters.sort = e.target.value;
  loadProductData();
}

export const HomePage = () => {
  return /*html*/ `
  <div class="bg-gray-50">
    ${Header()}
    <main class="max-w-md mx-auto px-4 py-4">
      <!-- 카테고리 -->
         ${ProductFilter(productState)}

      <!-- 총상품 수-->
      ${
        productState.loading
          ? ""
          : `      <div class="mb-4 text-sm text-gray-600">
      총 <span class="font-medium text-gray-900">${productState.total}개</span>의 상품
      </div>`
      }
      <!-- 상품 그리드 -->
      <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
        ${productState.loading ? ProductSkelleton().repeat(Number(productState.filters.limit)) : productState.products.map(ProductCard).join("")}
      </div>
          
    <div id="scroll-loading-indicator" class="text-center py-4" style="${productState.loading ? "" : "display:none"}">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
      </div>
    </div>

    </main>
    ${Footer()}
    <div class="flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
      ${CartAddToast()}
    </div>
  </div>
  `;
};
