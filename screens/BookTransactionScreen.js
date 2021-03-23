import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image, TextInput, Button ,  KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions' ;
import { BarCodeScanner } from 'expo-barcode-scanner';
import  firebase from 'firebase'
import db from '../config'
export default class TransactionScreen extends React.Component {
  constructor(){
    super()
    this.state={
      hasCameraPermissions:null,
      scanned:false,
     scannedBookId:'',
     scannedStudentId:'',
      ButtonState:'normal',
      TransactionMessage:''
    }
  }
  getCameraPermissions = async(id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions: status ==='granted',
      ButtonState:id,
      scanned:false
    })
  }
  initiateBookIssue = async ()=>{
    //add a transaction
    db.collection("Transaction").add({
      'studentId' : this.state.scannedStudentId,
      'bookId' : this.state.scannedBookId,
      'data' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType' : "Issue"
    })

    //change book status
    db.collection("Books").doc(this.state.scannedBookId).update({
      'BookAvailability' : false
    })
    //change number of issued books for student
    db.collection("Students").doc(this.state.scannedStudentId).update({
      'NumOfBookIssued' : firebase.firestore.FieldValue.increment(1)
    })

    this.setState({
      scannedStudentId : '',
      scannedBookId: ''
    })
  }
  initiateBookReturn = async ()=>{
    //add a transaction
    db.collection("Transactions").add({
      'studentId' : this.state.scannedStudentId,
      'bookId' : this.state.scannedBookId,
      'date'   : firebase.firestore.Timestamp.now().toDate(),
      'transactionType' : "Return"
    })

    //change book status
    db.collection("Books").doc(this.state.scannedBookId).update({
      'BookAvailability' : true
    })

    //change book status
    db.collection("Students").doc(this.state.scannedStudentId).update({
      'NumOfBookIssued' : firebase.firestore.FieldValue.increment(-1)
    })

    this.setState({
      scannedStudentId : '',
      scannedBookId : ''
    })
  }
  handleTransaction = async()=>{
    var TransactionMessage
    db.collection("Books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
      console.log(this.state.scannedBookId)
      var book = doc.data()
      if(book.BookAvailability){
        this.initiateBookIssue();
        TransactionMessage = "Book Issued"
        //Alert.alert(TransactionMessage)
        ToastAndroid.show(TransactionMessage,ToastAndroid.SHORT)
      }
      else{
        this.initiateBookReturn();
        TransactionMessage = "Book Returned"
       // Alert.alert(TransactionMessage)
       ToastAndroid.show(TransactionMessage,ToastAndroid.SHORT)
      }
    })
  }
  handleBarCodeScanned = async({type,data})=>{
   const {ButtonState}=this.state
   if (ButtonState === "BookId"){
     this.setState({
       scanned: true,
       scannedBookId: data,
       ButtonState:'normal'
     })
   }
   else
   if (ButtonState === "StudentId"){
    this.setState({
      scanned: true,
      scannedStudentId: data,
      ButtonState:'normal'
    })
  }
  }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const ButtonState = this.state.ButtonState;

      if (ButtonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }
      else if(ButtonState === "normal"){
        return (
          <KeyboardAvoidingView style={styles.container } behavior ='padding' enabled >
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200,height:200}}></Image>
              <Text style={{textAlign:'center',fontSize:30}}>Wily App</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({
                scannedBookId: text
              })}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
            style={styles.scanButton}
            onPress={()=>{
              this.getCameraPermissions("BookId")
            }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({
                scannedStudentId:text
              })}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity
            style={styles.scanButton}
            onPress={()=>{
              this.getCameraPermissions("StudentId")
            }}>
            <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.Submitbutton} onPress={async()=>{
              var TransactionMessage =  this.handleTransaction()
              this.setState({scannedBookId:'',scannedStudentId:''})
            }}>
              <Text>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
      
    }
  }
  const styles=StyleSheet.create({
    container:{
      flex: 1,
      justifyContent: 'center', 
      alignItems: 'center'
    },
    scanButton:{
      backgroundColor:'yellow',
      width: 50,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    text:{
      fontSize:20,
      color:'black'
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    inputView:{
    flexDirection:'row',
    margin:25
    }
  })