import React from "react";
import { StyleSheet, Text, View, Image} from "react-native";
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";

import TransactionScreen from "./screens/BookTransactionScreen";
import SearchScreen from "./screens/SearchScreen";

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const TabNavigator = createBottomTabNavigator({
  BookTransactionScreen: { screen: TransactionScreen },
  SearchScreen: { screen: SearchScreen },
  },
  {
  defaultNavigationOptions: ({ navigation})=>({
    tabBarIcon:()=>{
    const routeName = navigation.state.routeName 
    console.log(routeName)
    if (routeName === "BookTransactionScreen"){
      return(
        <Image source={require("./assets/book.png")}
        style={{width:40,height:40}}></Image>
      )
    }
    else if(routeName === "SearchScreen"){
      return(
        <Image source={require("./assets/searchingbook.png")}
        style={{width:40,height:40}}></Image>
      )
    }
    }
  })
}
);

const AppContainer = createAppContainer(TabNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center"
  }
});
