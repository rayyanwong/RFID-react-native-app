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

const {height, width} = Dimensions.get('window');

const DetailFlatList = ({data, handleClick}) => {
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
        keyExtractor={obj => String(obj.detailnum)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatlistStyle: {
    height: height / 2.5,
    backgroundColor: 'white',
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
  },
});

export default DetailFlatList;