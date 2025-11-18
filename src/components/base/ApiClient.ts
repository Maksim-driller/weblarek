import { IProduct } from "../../types";
import { Api } from "./Api";

type ProductListResponse = {
  total: number;
  items: IProduct[];
};

export class ApiClient {
  constructor(private readonly api: Api) {}

  async fetchProducts(): Promise<IProduct[]> {
    const response = await this.api.get<ProductListResponse>("/products");
    return response.items ?? [];
  }
}
