#include <Servo.h>
//Arduino Code
Servo candyServo;
//Define Server and it should listen to Pin 3 on the Arduino
int candyServoPin = 3;
//Setup Code for the Arudino that will initiate the Serial Port
//That the middleware telnet server will connect
void setup() {
  Serial.begin(57600);
  Serial.println("started");
}

void loop(){
  //listens for incoming string "give" on the Serial Port
  if (Serial.find("give")) {
    //Call release Candy after "give"
     releaseCandy();
  }
  
}


void releaseCandy(){
  //Writes back nomnom on the telnet server
  Serial.println("nomnomnom");
  //Will connect to the Server
  candyServo.attach(candyServoPin);
  //Relese Candy
  candyServo.write(150);
  //Disconnect
  delay(2000);
  candyServo.detach();
}
