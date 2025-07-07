// HomePage.js
import { getCategories, getProducts } from "../api/productApi";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { ProductFilter } from "../components/ProductFilter";
import { ProductSkelleton } from "../components/ProductSkelleton";
import { Footer } from "../components/Footer";
// 상품조회state
export const productState = {
  products: [],
  total: 0,
  categories: [],
  loading: false,
  page: 1,
  filters: {
    search: "",
    category1: "",
    category2: "",
    limit: 20,
    sort: "price_asc",
  },
  hasMore: true,
};

// 상품fetch
export async function loadProductData() {
  productState.loading = true;

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
      ${
        productState.loading
          ? `<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div class="space-y-2">
                <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
              </div>
            </div>`
          : ProductFilter(productState.filters)
      }
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
  </div>
  `;
};
