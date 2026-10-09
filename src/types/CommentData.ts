// Data angående kommentarene til brukerene.

export type CommentObject = UserComment;

export interface UserComment {
  id: string;
  author: string;
  comment: string;
}
