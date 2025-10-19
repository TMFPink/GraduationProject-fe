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
