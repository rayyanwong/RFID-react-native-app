import React from 'react';
import {View, StyleSheet, FlatList, Dimensions} from 'react-native';
import SMFlatlistCard from './SMFlatlistcard';

const height = Dimensions.get('window').height;

const StationMasterFlatlist = ({data, handleEdit, handleUserToEdit}) => {
  return (
    <View>
      <FlatList
        style={styles.flatlistStyle}
        data={data}
        keyExtractor={obj => {
          String(obj.userid);
        }}
        renderItem={({item}) => (
          <SMFlatlistCard
            data={item}
            handleEdit={handleEdit}
            handleUserToEdit={handleUserToEdit}
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

export default StationMasterFlatlist;
