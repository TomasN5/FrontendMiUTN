import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';
import PlanoViewer from './src/components/PlanoViewer/PlanoViewer';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="Subjects" 
          component={SubjectsScreen}
        />
        <Stack.Screen 
          name="PlanoViewer" 
          component={PlanoViewer} // Agregar esta línea
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;