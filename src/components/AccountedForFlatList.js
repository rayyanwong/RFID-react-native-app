import React from 'react';
import {View, StyleSheet, FlatList, Dimensions} from 'react-native';
import AccountingNameList from './AccountingNameList';

const AccountedForFlatList = ({accFor, unaccountManually}) => {
  return (
    <View>
      <FlatList
        style={styles.accountedContainer}
        data={accFor}
        keyExtractor={item => String(item.userid)}
        renderItem={({item}) => (
          <AccountingNameList
            data={item}
            func={unaccountManually}
            choice="acc"
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  accountedContainer: {
    flexGrow: 0,
    height: Dimensions.get('screen').height / 4,
    backgroundColor: 'white',
    marginHorizontal: 15,
  },
});

export default AccountedForFlatList;
