/*

Data for brukeren.
Skiller mellom deres roller.

*/

export type UserRole = "EventManager" | "Member";

export interface UserData {
  name: string;
  email: string;
  photoUrl?: string;
  role: UserRole;
}
