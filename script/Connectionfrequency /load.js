import http from 'k6/http';
import {check, sleep} from 'k6';


export let options = {

    vus: 300,
    duration: '100s',

    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};
// 테스트 하고자 하는 계정을 미리 등록시켜 놓는다
const BASE_URL = 'http://13.124.137.208:8080';
const USERNAME = 'abc@naver.com';
const PASSWORD = '1234';

export default function () {

    var payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });

    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };


    let loginRes = http.post(`${BASE_URL}/login/token`, payload, params);

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('accessToken') !== '',
    });


    let authHeaders = {
        headers: {
            Authorization: `Bearer ${loginRes.json('accessToken')}`,
        },
    };
    let myObjects = http.get(`${BASE_URL}/members/me`, authHeaders).json();
    check(myObjects, {'retrieved member': (obj) => obj.id != 0});
    sleep(1);
}