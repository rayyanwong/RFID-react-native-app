import React from 'react';
import {View, StyleSheet, Dimensions, Text, FlatList} from 'react-native';
import AccountingNameList from './AccountingNameList';
const NotAccountForFlatList = ({notAccFor, accountManually, noGoManually}) => {
  return (
    <View>
      <FlatList
        style={styles.notAccountedContainer}
        data={notAccFor}
        keyExtractor={item => String(item.userid)}
        renderItem={({item}) => (
          <AccountingNameList
            data={item}
            func={accountManually}
            func2={noGoManually}
            choice="notacc"
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  notAccountedContainer: {
    flexGrow: 0,
    height: Dimensions.get('screen').height / 5,
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default NotAccountForFlatList;
