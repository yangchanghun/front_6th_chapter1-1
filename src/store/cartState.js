export const cartState = {
  items: [],
};

export function loadCartFromStorage() {
  try {
    cartState.items = JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    cartState.items = [];
  }
}

export function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cartState.items));
}
