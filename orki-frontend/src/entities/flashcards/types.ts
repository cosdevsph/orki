export type Flashcard = {
  id: string;
  front: string;
  back: string;
  deck: string;
  is_due: boolean;
  interval: number;
  ease_factor: number;
  repetitions: number;
  next_review: string;
};

export type SrsQuality = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy
