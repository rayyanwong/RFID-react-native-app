import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './src/screens/Home';
import ScanningPage from './src/screens/ScanningPage';
import DatabasePage from './src/screens/DatabasePage';
import ConductDetails from './src/screens/ConductDetails';
import EditUserPage from './src/screens/EditUserPage';
import ParadeStatePage from './src/screens/ParadeStatePage';
import ParadeDetails from './src/screens/ParadeDetails';
import ConductingView from './src/screens/ConductingView';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{gestureEnabled: true, gestureDirection: 'horizontal'}}
        animation="fade">
        <Stack.Screen
          component={Home}
          name="Home"
          options={{headerShown: false}}
        />
        <Stack.Screen
          component={ConductDetails}
          name="ConductDetails"
          options={({route}) => ({
            title: route.params.name,
          })}
        />
        <Stack.Screen
          component={ConductingView}
          name="ConductingView"
          options={({route}) => ({title: route.params.name})}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const DatabaseStack = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="Database"
        screenOptions={{gestureEnabled: true, gestureDirection: 'horizontal'}}
        animation="fade">
        <Stack.Screen
          component={DatabasePage}
          name="Database"
          options={{headerShown: false}}
        />
        <Stack.Screen
          component={EditUserPage}
          name="EditUserPage"
          options={({route}) => ({title: route.params.name})}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const ParadeStateStack = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="Parade State"
        screenOptions={{gestureEnabled: true, gestureDirection: 'horizontal'}}
        animation="fade">
        <Stack.Screen
          component={ParadeStatePage}
          name="Parade State"
          options={{headerShown: false}}
        />
        <Stack.Screen
          component={ParadeDetails}
          name="ParadeDetailsPage"
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <>
      <NavigationContainer independent={true}>
        <Tab.Navigator
          initialRouteName="HomeStack"
          screenOptions={{
            tabBarActiveTintColor: '#000',
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 55,
              marginHorizontal: 24,
              position: 'absolute',
              borderRadius: 10,
              marginBottom: 16,
              justifyContent: 'space-evenly',
              backgroundColor: 'black',
            },
          }}>
          <Tab.Screen
            name="HomeStack"
            component={HomeStack}
            options={{
              tabBarShowLabel: false,
              headerShown: false,
              tabBarIcon: ({focused, color, size}) => (
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={focused ? 34 : 22}
                  color={focused ? 'white' : 'grey'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Scanning"
            component={ScanningPage}
            options={{
              headerShown: false,
              tabBarIcon: ({focused, color, size}) => (
                <Ionicons
                  name={focused ? 'scan-circle' : 'scan-circle-outline'}
                  size={focused ? 34 : 24}
                  color={focused ? 'white' : 'grey'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="DatabaseStack"
            component={DatabaseStack}
            options={{
              tabBarLabel: 'Database',
              headerShown: false,
              tabBarIcon: ({focused, color, size}) => (
                <MaterialCommunityIcons
                  name={focused ? 'database' : 'database-outline'}
                  size={focused ? 34 : 24}
                  color={focused ? 'white' : 'grey'}
                />
              ),
            }}
          />
          <Tab.Screen
            name="ParadeStateStack"
            component={ParadeStateStack}
            options={{
              tabBarLabel: 'Parade State',
              headerShown: false,
              tabBarIcon: ({focused}) => (
                <Ionicons
                  name={focused ? 'people-circle-outline' : 'people-circle'}
                  size={focused ? 34 : 24}
                  color={focused ? 'white' : 'grey'}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
