import React from 'react';
import {View, StyleSheet, Button} from 'react-native';
import {SupaUser} from '../../supabase/database';

const checkExist = async userNRIC => {
  const {data, error} = await SupaUser.findUser(userNRIC);
  if (error) {
    console.log(error);
  } else {
    console.log('Data is: ', data);
  }
};

const EditUserPage = props => {
  const userNRIC = props.route.params.data.userNRIC;
  const userObj = props.route.params.data;

  console.log(userNRIC);
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}></View>
      <View style={styles.btnContainer}>
        <Button
          title="Find User in Supbase"
          onPress={() => checkExist(userNRIC)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#dedbf0',
    alignContent: 'center',
  },
  infoContainer: {},
  btnContainer: {},
});

export default EditUserPage;
