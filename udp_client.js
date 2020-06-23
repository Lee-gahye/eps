// udp client 관련 
const dgram = require('dgram');
const packetGenerator = require('./packet_generator');
// const packetUtils = require('./packet_utils');
const client = dgram.createSocket('udp4');
const host = '192.168.0.42';
const udpPort = 1514;

// 파일 입출력
const fs = require('fs');

// 만들어서 보낼 메세지 개수
const numMessage = 500000;
// udp 메세지를 보낼때 딜레이 값. 값만큼 빈 루프를 돈다.
const sendMessageDelay = 200000;
// 보낸 메세지 카운트
let sendCount = 0;

var arrayByteLength = function(array) {
  sum=0;
  for (i =0;i< array.length;i++){
    sum +=  strByteLength(array[i]);
  }
  return sum
}

var strByteLength = function(s,b,i,c){
  for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
  return b
}

const createMessageToFile = (number, filename) => new Promise((resolve) => {
  const messageWriter = fs.createWriteStream(filename);

  messageWriter.on('finish', () => {
    resolve();
  });
  
  for (let i = 0; i < number; i++) {
    const packet = packetGenerator.createPacket();

    //console.log(arrayByteLength(packet) + " Bytes");

    messageWriter.write(packet + '\n');
  }

 messageWriter.end();
});

/**
 * udp 메세지를 보내는 함수. 비동기 핸들링을 할 수 있도록 Promise 사용.
 */
const sendMessage = (line) => new Promise((resolve) => {
  client.send(line, udpPort, host, (err) => {
    if (err) throw err;

    sendCount++;
    resolve();
  });
});

/**
 * 파일에서 메세지를 읽어와 udp로 보내는 함수.
 * async await를 이용해 동기 처리.
 *
 * delay를 주기위한 코드가 있음. delay가 없으면 udp의 유실률이 커짐.
 * sendMessage 함수에 setTimeout을 입혀 딜레이를 줄 수도 있음.
 * 하지만 밀리초로 밖에 안되고 1000개 송신에 1.4초 정도 소요됨.
 * 아래 반복문을 통한 딜레이 코드는 훨씬 빠르게 전송할 수 있음.
 * 1000개 송신하는데 유실률 0였지만 싱글쓰레드를 잡고 있는게 조금 문제?
 */
const sendMessageToUdp = (filename) => new Promise((resolve) => {
  // 파일을 읽어서 line 별로 udp 송신
  fs.readFile(filename, 'utf8', async (err, data) => {
    if (err) throw err;

    // '\n' 구분자로 split을 하면 마지막에 빈 문자열이 나오므로 제거
    const lines = data.split('\n').slice(0, -1);

    for (let i = 0; i < lines.length; i++) {
      await sendMessage(lines[i]);

      // delay 코드. 200000을 딜레이로 주면 5000개 송신에 1.4초 정도 걸림.
      // 1000개 송신은 0.3초 정도 걸림.
      // 다만 setTimout 코드와 다르게 kafka_consumer와 같이 실행하면
      // 1.5배 정도 느려짐.
      for (let j = 0; j < sendMessageDelay; j++) { } 
    }

    resolve();
  });
});

const run = async () => {
  const startDate = Date.now();

  // 5000개의 메세지를 만들어 파일로 저장.
  await createMessageToFile(numMessage, 'result_send_udp.txt');

  // 저장한 파일을 읽어 udp로 송신
  await sendMessageToUdp('result_send_udp.txt');
  //
  console.log('sendCount: ' + sendCount);
  console.log('running time: ' + (Date.now() - startDate));
  client.close();
}

run();
