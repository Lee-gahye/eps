// const moment=require('moment');

const MAX_NUM=7;
const hash=['HIIB', 'PROXY', 'XSS', 'NETWORK_SCANNING','BRUTE_FORCE_RDP','NETWORK_SNIFFING','WEB_SERVICE'];
const protocolTypes=['udp', 'tcp'];
const src_ip=['192.168.0.40', '192.168.0.41', '192.168.0.42','192.168.0.43','192.168.0.44','192.168.0.45','192.168.0.46'];
const dst_ip=['1.37.29.126','182.162.61.149','13.224.162.147','104.86.182.35','23.210.215.65','23.15.196.10','210.89.187.78'];
const rule=['Cpfk5zm2AeY7thvR','Cfl1q57wp5fyK5Fd','CmOkNCI4OKJFAgjB','CmOkNCI4OKJFAgjB','CagpLInCXtzJUfqa','CJaySq5n6iUWFAp6','CQ2Kt4BC8m1v8rTV','CTvX61B36FxFGoOk'];
const src_port=['2491','9821','3034','55308','50670','57935','53067'];
const dst_port=['8123','80','9200','28085','8124','10080','50222'];
const http_method=['UGZY','AWHK','HEAD','QKGB','BNFR','GET','DEBUG'];
// const http_retcode =['200','201','202','203','204','205','206'];
const http_host = ['fast.com','www.4.cn','d3js.org','nas2dual','avian.pk','mgr.am','kocca.kr'];

// 패킷에 AttackName 프로퍼티를 추가함.
// type값은 정수로 받고 4가지 타입이 존재.
const addHash=(packet, max) => {
  var rand2=Math.floor(Math.random() * max);
  const data='hash="' + hash[rand2] + '"';
  return packet + "," + data;
};

const addProtocolTypes=(packet, max) => {
  var rand2=Math.floor(Math.random() * max);
  const data='protocol="' + protocolTypes[rand2] + '"';
  return packet + "," + data;
};

const addSrc_ip=(packet, max) => {
  var rand2=Math.floor(Math.random() * max);
  const data='src_ip="' + src_ip[rand2] + '"';
  return data;
};

const addDst_ip=(packet, max) => {
  var rand2=Math.floor(Math.random() * max);
  const data='dst_ip="' + dst_ip[rand2] + '"';
  return packet + "," + data;
};

const addSrc_port=(packet, max) => {
  var rand2=Math.floor(Math.random() * max);
  const data='src_port="' + src_port[rand2] + '"';
  return packet + "," + data;
};

const addDst_port=(packet, max) => {
  var rand2=Math.floor(Math.random() * max);
  const data='dst_port="' + dst_port[rand2] + '"';
  return packet + "," + data;
};

const addRule=(packet, max) => {
  const data1='app="HTTP"';
  var rand2=Math.floor(Math.random() * max);
  const data2='rule="' + rule[rand2] + '"';
  return packet + "," + data1 + "," + data2;

};

const addHttp_method=(packet, max) => {
  var rand2=Math.floor(Math.random() * max);
  const data1 = 'http_method="' + http_method[rand2] + '"';
  const data2 = 'http_host="' + http_host[rand2] + '"';
  return packet + "," + data1 + "," + data2;
};

function getTimeStamp() {
  var d=new Date();
  var s =
      leadingZeros(d.getFullYear(), 4) + '-' +
      leadingZeros(d.getMonth() + 1, 2) + '-' +
      leadingZeros(d.getDate(), 2) + ' ' +

      leadingZeros(d.getHours(), 2) + ':' +
      leadingZeros(d.getMinutes(), 2) + ':' +
      leadingZeros(d.getSeconds(), 2);

  return s;
}

function leadingZeros(n, digits) {
  var zero='';
  n=n.toString();

  if (n.length < digits) {
    for (i=0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

const addLogtime=(packet) => {
  data='logtime="' + Date.now() + '"';
  packet.push(data)
  return packet;
};

// 하나의 패킷 데이터를 생성하여 반환함.
exports.createPacket=() => {

  let packet=addSrc_ip([], MAX_NUM);
  packet=addDst_ip(packet, MAX_NUM);
  packet=addSrc_port(packet, MAX_NUM);
  packet=addDst_port(packet, MAX_NUM);
  packet=addHash(packet, MAX_NUM);
  packet=addHttp_method(packet, MAX_NUM); //method, host
  packet=addProtocolTypes(packet,2);
  packet=addRule(packet, MAX_NUM); //app, rule

  return packet;
};
