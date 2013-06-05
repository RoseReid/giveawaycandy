#include <Servo.h>

Servo candyServo;
int candyServoPin = 3;

void setup() {
  Serial.begin(57600);
  Serial.println("started");
}


void loop(){
  if (Serial.available()) {
     Serial.find("give");
     releaseCandy();
  }
  
}

void releaseCandy(){
  Serial.println("nomnomnom");
  candyServo.attach(candyServoPin);
  candyServo.write(150);
  delay(2000);
  candyServo.detach();
}
