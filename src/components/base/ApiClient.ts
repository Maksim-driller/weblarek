import {
  IApi,
  IOrderRequest,
  IOrderResponse,
  IProduct,
  IProductListResponse,
} from "../../types";

export class ApiClient {
  constructor(private readonly api: IApi) {}

  async fetchProducts(): Promise<IProduct[]> {
    const response = await this.api.get<IProductListResponse>("/product/");
    return response.items ?? [];
  }

  sendOrder(data: IOrderRequest) {
    return this.api.post<IOrderResponse>("/order/", data);
  }
}
