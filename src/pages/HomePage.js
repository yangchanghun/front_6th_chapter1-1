// HomePage.js
import { getCategories, getProducts } from "../api/productApi";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { ProductFilter } from "../components/ProductFilter";
import { ProductSkelleton } from "../components/ProductSkelleton";
// 상품조회state
export const productState = {
  products: [],
  total: 0,
  categories: [],
  loading: false,
  filters: {
    search: "",
    category1: "",
    category2: "",
    limit: 20,
    sort: "price_asc",
  },
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
    getProducts({ limit: productState.filters.limit, sort: productState.filters.sort }),
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

  limitSelect.removeEventListener("change", limitChange);
  limitSelect.addEventListener("change", limitChange);

  sortSelect.removeEventListener("change", sortChange);
  sortSelect.addEventListener("change", sortChange);
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
  // 초기 로딩 시작
  if (!productState.loading && productState.products.length === 0) {
    productState.loading = true;
    loadProductData();
  }

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
        ${productState.loading ? ProductSkelleton().repeat(productState.limit) : productState.products.map(ProductCard).join("")}
      </div>
    </main>
  </div>
  `;
};
