// udp client 관련 
const dgram = require('dgram');
const packetGenerator = require('./packet_generator');
// const packetUtils = require('./packet_utils');
const client = dgram.createSocket('udp4');
const host = '192.168.0.44';
const udpPort = 1514;

// 파일 입출력
const fs = require('fs');

// 만들어서 보낼 메세지 개수
let numMessage = 500000;
// udp 메세지를 보낼때 딜레이 값. 값만큼 빈 루프를 돈다.
const sendMessageDelay = 300000;
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
    messageWriter.write(packetGenerator.createPacket() + '\n')
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

const sendMessageToUdp = async (filename) => {
//파일 한번에 다 읽음
  const data = fs.readFileSync('result_send_udp.txt', 'utf-8').trimRight().split('\n')

  for (let i = 0;i < numMessage; i++){
    await sendMessage(`logtime="${Date.now()}",${data[i % data.length]}`);
    for (let j = 0; j < sendMessageDelay; j++) { }
  }
};
process.argv.forEach(function (val, index, array) {
  if (index ==2){
    numMessage = (val > 0 ) ? val: 500000;
    console.log(index + ': ' + val);
  }
});

const run = async () => {
  const startDate = Date.now();

  //???개의 메세지를 만들어 파일로 저장.
  await createMessageToFile(numMessage, 'result_send_udp.txt');

  // 저장한 파일을 읽어 udp로 송신
  await sendMessageToUdp('result_send_udp.txt');
  //
  console.log('sendCount: ' + sendCount);
  console.log('running time: ' + (Date.now() - startDate));
  client.close();
}

run();
