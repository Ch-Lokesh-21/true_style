export interface ProductType {
  _id: string;
  type: string;
  size_chart_url: string;
  thumbnail_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductTypeCreate {
  type: string;
  size_chart: File;
  thumbnail: File;
}

export interface ProductTypeUpdate {
  type?: string;
  size_chart?: File;
  thumbnail?: File;
}

export interface ProductTypeFormData {
  type: string;
  size_chart?: FileList;
  thumbnail?: FileList;
}

export interface ProductTypeListParams {
  skip?: number;
  limit?: number;
}
