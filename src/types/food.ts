export interface FoodItem {
  id: number;
  title: string;
  emoji: string;
  description: string;
  distance: string;
  tags: string[];
  weight: number;
  skip_today: number;
  created_at: string;
}

export interface FoodFormData {
  title: string;
  emoji: string;
  description: string;
  distance: string;
  tags: string[];
}
