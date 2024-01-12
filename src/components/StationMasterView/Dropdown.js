import React from 'react';
import {View, StyleSheet} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Dropdown = ({
  data,
  defaultText,
  searchPlaceholderText,
  handleOnSelect,
  width,
  btnColor,
}) => {
  return (
    <View>
      <SelectDropdown
        data={data}
        onSelect={(selectedItem, index) => {
          handleOnSelect(selectedItem);
          console.log('Selected:', selectedItem);
        }}
        defaultButtonText={defaultText}
        buttonTextAfterSelection={(selectedItem, index) => {
          return selectedItem;
        }}
        rowTextForSelection={(item, index) => {
          return item;
        }}
        buttonStyle={[
          styles.dropdownBtnStyle,
          {width: width, backgroundColor: btnColor},
        ]}
        buttonTextStyle={styles.dropdownBtnTextStyle}
        renderDropdownIcon={isOpened => {
          return (
            <FontAwesome
              name={isOpened ? 'chevron-up' : 'chevron-down'}
              color={'#FFF'}
              size={18}
            />
          );
        }}
        dropdownIconPosition="right"
        dropdownStyle={styles.dropdownDropdownStyle}
        rowStyle={styles.dropdownRowStyle}
        rowTextStyle={styles.dropdownRowTextStyle}
        selectedRowStyle={styles.dropdownSelectedRowStyle}
        search
        searchInputStyle={styles.dropdownSearhInputStyle}
        searchPlaceHolder={searchPlaceholderText}
        searchPlaceHolderColor="#F8F8F8"
        renderSearchInputLeftIcon={() => {
          return <FontAwesome name="search" color="#FFF" size={18} />;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownBtnStyle: {
    height: 45,
    borderRadius: 8,
    marginVertical: 8,
    marginTop: 16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  dropdownBtnTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'OpenSans-Bold',
  },
  dropdownDropdownStyle: {
    backgroundColor: '#444',
    borderRadius: 12,
  },
  dropdownRowStyle: {
    backgroundColor: '#444',
    borderBottomColor: '#C5C5C5',
  },
  dropdownRowTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'OpenSans-Bold',
  },
  dropdownSelectedRowStyle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dropdownSearhInputStyle: {
    backgroundColor: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
});

export default Dropdown;
