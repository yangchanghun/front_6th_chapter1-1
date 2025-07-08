export function getCartCount() {
  try {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (e) {
    console.error(e);
  }
}
