import React from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import FlatlistCard from '../components/Flatlist-card';

const NewDetailFlatList = ({data, handleDelete}) => {
  return (
    <FlatList
      style={styles.flatlist}
      data={data}
      keyExtractor={item => String(item.userid)}
      renderItem={({item}) => (
        <FlatlistCard
          data={item}
          handleDelete={() => {
            handleDelete(item.userid);
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
    marginTop: 20,
  },
});

export default NewDetailFlatList;
