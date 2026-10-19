export type DrawerParamList = {
  Home: undefined;
  Explore: undefined;
  TV: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Details: { itemId: string };
  Player: { videoId: string };
  /** Jirani's check-in card, shown over everything. */
  Checkin: { id: string; residentName: string; message: string };
};
