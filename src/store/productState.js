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
