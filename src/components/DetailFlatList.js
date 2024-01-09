import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import customStyle from '../../styles';
import FlatlistCard from './ConductingView/components/Flatlist-card';

const {height, width} = Dimensions.get('window');

const DetailFlatList = ({data, handleClick, handleDelete}) => {
  console.log(data);
  if (data.length === 0) {
    return (
      <View
        style={[
          styles.flatlistStyle,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        <View style={{justifyContent: 'center', marginBottom: 10}}>
          <ActivityIndicator size="small" color="#5500dc" />
        </View>
        <Text
          style={{
            color: customStyle.text,
            fontSize: 16,
            fontFamily: 'OpenSans-Bold',
          }}>
          There are currently no details
        </Text>
      </View>
    );
  }
  return (
    <View>
      <FlatList
        style={styles.flatlistStyle}
        data={data}
        keyExtractor={obj => String(obj.detailName)}
        renderItem={({item}) => (
          <FlatlistCard
            data={item}
            onPress={() => handleClick(item)}
            handleDelete={() => handleDelete(item.detailName)}
            field="detailName"
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatlistStyle: {
    height: height / 2.5,
    backgroundColor: 'white',
    alignSelf: 'center',
    width: '90%',
    borderWidth: 1,
  },
});

export default DetailFlatList;
