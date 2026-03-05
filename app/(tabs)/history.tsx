import { StyleSheet, Text, View } from 'react-native';

export default function TabTwoScreen() {
  return (
    
<View style={styles.container}>

  <Text style={styles.text}>History</Text>

</View>

  )
   
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
  },
 
});
