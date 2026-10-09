import { useCallback, useEffect, useState } from "react";
import { EventData } from "@/src/types/EventData";
import { UserData } from "@/src/types/UserData";
import {
  getEventsUserJoined,
  getFavoriteEventsForUser,
  getUserPosts,
} from "@/src/api/postService";
import { getUserProfile } from "@/src/api/userService";
import { User } from "firebase/auth";
import { splitEventsByDate } from "./EventDateUtils";

type JoinedEventsByStatus = {
  past: EventData[];
  ongoing: EventData[];
  upcoming: EventData[];
};

type UseProfileDataResult = {
  isLoading: boolean;
  userProfile: UserData | null;
  pastEvents: EventData[];
  ongoingEvents: EventData[];
  upcomingEvents: EventData[];
  favoriteEvents: EventData[];
  joinedEvents: JoinedEventsByStatus;
  reload: () => void;
};

export function useProfileData(user: User | null): UseProfileDataResult {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserData | null>(null);

  const [pastEvents, setPastEvents] = useState<EventData[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<EventData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<EventData[]>([]);

  const [joinedEvents, setJoinedEvents] = useState<JoinedEventsByStatus>({
    past: [],
    ongoing: [],
    upcoming: [],
  });

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getUserProfile(user.uid);
      if (profile) setUserProfile(profile);

      const myPosts = await getUserPosts(user.uid);
      const myFavorites = await getFavoriteEventsForUser(user.uid);
      const myJoined = await getEventsUserJoined(user.uid);

      const { past, ongoing, upcoming } = splitEventsByDate(myPosts);
      setPastEvents(past);
      setOngoingEvents(ongoing);
      setUpcomingEvents(upcoming);

      const joinedSplit = splitEventsByDate(myJoined);
      setJoinedEvents(joinedSplit);

      setFavoriteEvents(myFavorites);
    } catch (e) {
      console.log("Error loading profile data", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    isLoading,
    userProfile,
    pastEvents,
    ongoingEvents,
    upcomingEvents,
    favoriteEvents,
    joinedEvents,
    reload: loadData,
  };
}
