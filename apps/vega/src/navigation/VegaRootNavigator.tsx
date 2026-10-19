import { createNativeStackNavigator } from '@amazon-devices/react-navigation__native-stack';
import { RootStackParamList } from './types';
import VegaDrawerNavigator from './VegaDrawerNavigator';
import { CheckinScreen, DetailsScreen, PlayerScreen } from '@multi-tv/shared-ui';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function VegaRootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={VegaDrawerNavigator} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Checkin" component={CheckinScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack.Navigator>
  );
}
