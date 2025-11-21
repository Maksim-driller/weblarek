export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export type TPayment = "card" | "cash";

export interface ICustomer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export interface IBuyer extends ICustomer {}

export interface IProductListResponse {
  total: number;
  items: IProduct[];
}

export interface IOrderRequest extends ICustomer {
  items: string[];
  total: number;
}

export interface IOrderResponse {
  id: string;
  total: number;
}
