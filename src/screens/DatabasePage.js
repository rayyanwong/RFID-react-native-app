import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import NamesList from '../components/NamesList';

const db = openDatabase({
  name: 'appDatabase',
});

const DatabasePage = ({navigation}) => {
  const [allNames, setallNames] = useState([]);
  const [isLoading, setisLoading] = useState(false);

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
            setisLoading(false);
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
    setisLoading(true);
    loadAllNames();
  }, []);

  useEffect(() => {
    loadAllNames();
  });

  const handleUserDetails = userObj => {
    navigation.navigate('EditUserPage', {
      name: userObj.userName,
      data: userObj,
    });
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.headerText}>Soldiers</Text>
      </View>
      <FlatList
        marginHorizontal={10}
        marginTop={30}
        showsHorizontalScrollIndicator={false}
        data={allNames}
        keyExtractor={item => String(item.userid)}
        renderItem={({item}) => (
          <NamesList
            data={item}
            removeUser={removeUser}
            handleUserDetails={handleUserDetails}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fbfcfd',
    flex: 1,
  },
  headerText: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'OpenSans-Bold',
    fontWeight: '300',
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    borderRadius: 6,
    alignItems: 'center',
    alignItems: 'center',
  },
});

export default DatabasePage;
