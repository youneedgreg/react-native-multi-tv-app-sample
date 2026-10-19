export type RootStackParamList = {
  DrawerNavigator: undefined;
  Details: {
    title: string;
    description: string;
    headerImage: string;
    movie: string;
    category?: string;
    genres?: string[];
    releaseYear?: number;
    rating?: number;
    ratingCount?: number;
    contentRating?: string;
    duration?: number;
  };
  Player: {
    movie: string;
    headerImage: string;
  };
  /** Jirani's check-in card, shown over everything. */
  Checkin: {
    id: string;
    residentName: string;
    message: string;
  };
};

export type DrawerParamList = {
  Home: undefined;
  Explore: undefined;
  TV: undefined;
  Settings: undefined;
};
