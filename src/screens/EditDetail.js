import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

const EditDetail = props => {
  console.log(props);
  const navigation = props;
  const detailObj = props.route.params.detailObj;
  console.log(detailObj);

  return (
    <View>
      <Text style={{color: 'black'}}>EditDetailPage</Text>
    </View>
  );
};

const styles = StyleSheet.create({});

export default EditDetail;
