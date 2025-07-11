import { addCart } from "../store/localState";
import { AddCartTost } from "./Toast";
import { navigateToDetail } from "../routes/router";

export async function detailEvent() {
  const root = document.querySelector("#root");

  // 🧹 기존 리스너 정리
  if (root._detailClickHandler) {
    root.removeEventListener("click", root._detailClickHandler);
  }
  if (root._cartClickHandler) {
    root.removeEventListener("click", root._cartClickHandler);
  }
  if (root._relatedClickHandler) {
    root.removeEventListener("click", root._relatedClickHandler);
  }

  // ➕ 수량 증감 핸들러 등록
  const detailClickHandler = (e) => {
    const quantityInput = document.querySelector("#quantity-input");
    if (!quantityInput) return;

    if (e.target.closest("#quantity-decrease")) {
      let current = parseInt(quantityInput.value);
      if (current > 1) {
        quantityInput.value = current - 1;
      }
    }

    if (e.target.closest("#quantity-increase")) {
      let current = parseInt(quantityInput.value);
      quantityInput.value = current + 1;
    }
  };
  root.addEventListener("click", detailClickHandler);
  root._detailClickHandler = detailClickHandler;

  // ➕ 장바구니 추가 핸들러 등록
  const cartClickHandler = async (e) => {
    if (e.target.matches("#add-to-cart-btn")) {
      console.log("장바구니 버튼 클릭됨");

      const productId = e.target.getAttribute("data-product-id");

      try {
        const res = await fetch(`/api/products/${productId}`);
        const productData = await res.json();

        const quantityInput = document.querySelector("#quantity-input");
        const quantity = quantityInput ? quantityInput.value : 1;

        const product = {
          productId: productData.productId,
          title: productData.title,
          image: productData.image,
          price: productData.lprice,
          quantity,
        };
        addCart(product, quantity);

        const toast = document.getElementById("cart-toast");
        if (toast) {
          toast.classList.remove("hidden");
          toast.classList.add("opacity-100");

          setTimeout(() => {
            toast.classList.add("opacity-0");
            setTimeout(() => {
              toast.classList.remove("opacity-100", "opacity-0");
              toast.classList.add("hidden");
            }, 500);
          }, 3000);
        }

        if (quantityInput) quantityInput.value = 1;
      } catch (error) {
        console.error("장바구니 추가 실패:", error);
      }
    }
  };
  root.addEventListener("click", cartClickHandler);
  root._cartClickHandler = cartClickHandler;

  //
  const relatedClickHandler = (e) => {
    const card = e.target.closest(".related-product-card");
    if (card) {
      const productId = card.getAttribute("data-product-id");
      navigateToDetail(productId);
    }
  };
  root.addEventListener("click", relatedClickHandler);
  root._relatedClickHandler = relatedClickHandler;
}

export async function productDetailPage(id) {
  // 1. 로딩 UI
  document.querySelector("#root").innerHTML = productDetailLoadingContent();

  try {
    const res = await fetch(`/api/products/${id}`);
    const product = await res.json();
    console.log("디테일product:", product);

    // 2. 관련 상품 받아오기 - 현재 상품 ID를 전달
    const related = await fetchRelatedProducts(product.category1, product.productId);

    // 3. 렌더링
    const html = productDetailContent(product, related);
    document.querySelector("#root").innerHTML = html;
  } catch (error) {
    document.querySelector("#root").innerHTML = `<p>상품 정보를 불러올 수 없습니다: ${error.message}</p>`;
  }
}

async function fetchRelatedProducts(category1, currentProductId) {
  try {
    const searchParams = new URLSearchParams({ limit: 20, category1 });
    const res = await fetch(`/api/products?${searchParams}`);
    const data = await res.json();

    // 현재 상품을 제외한 관련 상품들 필터링
    const related = data.products.filter((p) => p.productId !== currentProductId);
    console.log("관련 상품 개수:", related.length); // 디버그용
    console.log("현재 상품 ID:", currentProductId); // 디버그용

    return related;
  } catch (e) {
    console.error("관련 상품 로딩 실패:", e);
    return []; // 실패 시 빈 배열 반환
  }
}

function productDetailLoadingContent() {
  return `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
            </div>
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="max-w-md mx-auto px-4 py-4">
        <div class="py-20 bg-gray-50 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>
      <footer class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto py-8 text-center text-gray-500">
          <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
        </div>
      </footer>
    </div>
  `;
}

function productDetailContent(product, related = []) {
  return `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
            </div>
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  1
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 브레드크럼 -->
        <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <button class="breadcrumb-link" data-category1="${product.category1}">
              ${product.category1}
            </button>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <button class="breadcrumb-link" data-category2="${product.category2}">
              ${product.category2}
            </button>
          </div>
        </nav>
        <!-- 상품 상세 정보 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <!-- 상품 이미지 -->
          <div class="p-4">
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover product-detail-image">
            </div>
            <!-- 상품 정보 -->
            <div>
              <p class="text-sm text-gray-600 mb-1"></p>
              <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
              <!-- 평점 및 리뷰 -->
              <div class="flex items-center mb-3">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <span class="ml-2 text-sm text-gray-600">4.0 (749개 리뷰)</span>
              </div>
              <!-- 가격 -->
              <div class="mb-4">
                <span class="text-2xl font-bold text-blue-600">${product.lprice}원</span>
              </div>
              <!-- 재고 -->
              <div class="text-sm text-gray-600 mb-4">
                재고 107개
              </div>
              <!-- 설명 -->
              <div class="text-sm text-gray-700 leading-relaxed mb-6">
                ${product.description || "상품 설명이 없습니다."}
              </div>
            </div>
          </div>
          <!-- 수량 선택 및 액션 -->
          <div class="border-t border-gray-200 p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-900">수량</span>
              <div class="flex items-center">
                <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-l-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <input type="number" id="quantity-input" value="1" min="1" max="107" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-r-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>
            <!-- 액션 버튼 -->
            <button id="add-to-cart-btn" data-product-id="${product.productId}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md
                 hover:bg-blue-700 transition-colors font-medium">
              장바구니 담기
            </button>
          </div>
        </div>
        <!-- 상품 목록으로 이동 -->
        <div class="mb-6">
          <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
            hover:bg-gray-200 transition-colors go-to-product-list">
            상품 목록으로 돌아가기
          </button>
        </div>
        <!-- 관련 상품 -->
        ${
          related.length > 0
            ? `
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-3 responsive-grid">
              ${related
                .map(
                  (item) => `
                <div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer" data-product-id="${item.productId}">
                  <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover" loading="lazy">
                  </div>
                  <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${item.title}</h3>
                  <p class="text-sm font-bold text-blue-600">${item.lprice}원</p>
                </div>
                `,
                )
                .join("")}
            </div>
          </div>
        </div>
        `
            : ""
        }
        ${AddCartTost}
      </main>
      <footer class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto py-8 text-center text-gray-500">
          <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
        </div>
      </footer>
    </div>
  `;
}
