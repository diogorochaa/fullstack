export type OrderResponseDto = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};
