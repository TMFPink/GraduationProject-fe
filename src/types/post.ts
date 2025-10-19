// ========= This is sample interface ========= //
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
}

// ========= This is real interface ========= //
export interface PostReal {
  post_id: string;
  user_id: string;
  title: string;
  content: string;
  thumbnail: string;
  media_url: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  createdAt: string; // $date-time
  updatedAt: string; // $date-time
}
