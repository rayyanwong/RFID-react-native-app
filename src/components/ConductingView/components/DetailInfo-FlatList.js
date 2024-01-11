import React from 'react';
import {View, StyleSheet, FlatList, Dimensions} from 'react-native';
import FlatlistCard from './Flatlist-card';

const height = Dimensions.get('window').height;

const DetailInfoFlatList = ({data, handleDelete}) => {
  return (
    <View>
      <FlatList
        style={styles.flatlistStyle}
        data={data}
        keyExtractor={obj => {
          String(obj.userid);
        }}
        renderItem={({item}) => (
          <FlatlistCard
            data={item}
            handleDelete={() => handleDelete(item)}
            field="userName"
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatlistStyle: {
    height: (height / 2) * 0.9,
    backgroundColor: 'white',
    alignSelf: 'center',
    width: '90%',
    borderWidth: 1,
    marginTop: 24,
  },
});

export default DetailInfoFlatList;
