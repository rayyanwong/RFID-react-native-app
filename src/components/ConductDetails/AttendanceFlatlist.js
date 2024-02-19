import React from 'react';
import {View, StyleSheet, FlatList, Text, Dimensions} from 'react-native';
import FlatlistCard from './Flatlist-card';

const AttendanceFlatlist = ({data}) => {
  return (
    <View>
      <FlatList
        style={styles.flatlist}
        data={data}
        keyExtractor={item => String(item.userid)}
        renderItem={({item}) => (
          <FlatlistCard
            userObj={item}
            handleClick={() => {}}
            handleGo={() => {
              {
              }
            }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatlist: {
    borderWidth: 1,
    width: '85%',
    alignSelf: 'center',
    borderRadius: 6,
    flexGrow: 0,
    height: Dimensions.get('window').height / 2,
    marginTop: 6,
  },
});

export default AttendanceFlatlist;
