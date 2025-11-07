export interface PCComponent {
  category: string;
  name: string;
  price: string;
  features: string[];
}

export interface AiResponse {
  analysis: string;
  components: PCComponent[];
}
