interface Product {
  image: string | null;
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
}

interface Cart {
  productId: string;

  count: number;
}
