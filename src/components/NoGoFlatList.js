import React from 'react';
import {View, StyleSheet, Dimensions, Text, FlatList} from 'react-native';
import NoGoNameList from './NoGoNameList';
const NoGoFlatList = ({noGoArr, forceGoManually}) => {
  return (
    <View>
      <FlatList
        style={styles.noGoContainer}
        data={noGoArr}
        keyExtractor={item => String(item.userid)}
        renderItem={({item}) => (
          <NoGoNameList data={item} func={forceGoManually} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  noGoContainer: {
    flexGrow: 0,
    height: Dimensions.get('screen').height / 5,
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default NoGoFlatList;
