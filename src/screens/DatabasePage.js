import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NamesList from '../components/NamesList';

const db = openDatabase({
  name: 'appDatabase',
});

const DatabasePage = () => {
  const [allNames, setallNames] = useState([]);

  const loadAllNames = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM USERS`,
        [],
        (txObj, resultSet) => {
          if (resultSet.rows.length == 0) {
            return;
          } else {
            var existingNames = resultSet.rows;
            var tempNames = [];
            for (let i = 0; i < existingNames.length; i++) {
              tempNames.push(existingNames.item(i));
            }
            setallNames(tempNames);
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const removeUser = userid => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM ATTENDANCE WHERE USERID = (?)`,
        [userid],
        (txObj, resultSet) => {
          db.transaction(tx => {
            tx.executeSql(
              `DELETE FROM USERS WHERE userid = (?)`,
              [userid],
              (txObj, resultSet) => {
                if (resultSet.rowsAffected > 0) {
                  Alert.alert(`Successfully removed user from database`);
                  var existingNames = [...allNames].filter(data => {
                    data.userid !== userid;
                  });
                  setallNames(existingNames);
                  loadAllNames();
                }
              },
              error => {
                console.log(error);
              },
            );
          });
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  useEffect(() => {
    loadAllNames();
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        marginHorizontal={10}
        marginTop={30}
        showsHorizontalScrollIndicator={false}
        data={allNames}
        keyExtractor={item => String(item.userid)}
        renderItem={({item}) => (
          <NamesList data={item} removeUser={removeUser} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dedbf0',
    flex: 1,
  },
});

export default DatabasePage;
