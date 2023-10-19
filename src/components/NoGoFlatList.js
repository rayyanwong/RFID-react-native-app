import React from 'react';
import {View, StyleSheet, Dimensions, Text, FlatList} from 'react-native';

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
    height: Dimensions.get('screen').height / 4,
    backgroundColor: 'white',
    marginHorizontal: 15,
  },
});

export default NoGoFlatList;
