import React from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import FlatlistCard from '../components/Flatlist-card';

const NewDetailFlatList = ({data}) => {
  return (
    <FlatList
      style={styles.flatlist}
      data={data}
      keyExtractor={item => String(item.userName)}
      renderItem={({item}) => (
        <FlatlistCard
          data={item}
          handleDelete={() => {
            console.log('User deleted');
          }}
          onPress={() => {}}
          field="userName"
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatlist: {
    borderWidth: 1,
    width: '85%',
    alignSelf: 'center',
    borderRadius: 6,
    flexGrow: 0,
    height: '50%',
  },
});

export default NewDetailFlatList;
