/**
 * k6 Load Test Configuration — VietNet Interior
 *
 * Install: https://k6.io/docs/get-started/installation/
 * Run: k6 run scripts/load-test.js
 * Run with env: k6 run -e BASE_URL=https://bhquan.site scripts/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const homepageLatency = new Trend('homepage_latency');
const apiLatency = new Trend('api_latency');

const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const API_URL = `${BASE_URL}/api`;

export const options = {
  stages: [
    // Ramp up
    { duration: '1m', target: 20 },   // 20 concurrent users
    { duration: '3m', target: 50 },   // scale to 50
    { duration: '2m', target: 100 },  // peak load
    { duration: '3m', target: 100 },  // sustain peak
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% requests under 2s
    errors: ['rate<0.05'],              // error rate under 5%
    homepage_latency: ['p(95)<3000'],   // homepage under 3s
    api_latency: ['p(95)<500'],         // API under 500ms
  },
};

export default function () {
  group('Homepage (SSR)', () => {
    const res = http.get(BASE_URL);
    check(res, {
      'homepage status 200': (r) => r.status === 200,
      'homepage has content': (r) => r.body && r.body.length > 1000,
    });
    homepageLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  group('Project Listing API', () => {
    const res = http.get(`${API_URL}/projects?page=1&limit=12&status=published`);
    check(res, {
      'projects status 200': (r) => r.status === 200,
      'projects has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true;
        } catch {
          return false;
        }
      },
    });
    apiLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  group('Articles Listing API', () => {
    const res = http.get(`${API_URL}/articles?page=1&limit=10&status=published`);
    check(res, {
      'articles status 200': (r) => r.status === 200,
    });
    apiLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  group('Health Check', () => {
    const res = http.get(`${API_URL}/health`);
    check(res, {
      'health status 200': (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  group('Page View Analytics', () => {
    const pages = ['/', '/projects', '/catalog', '/articles', '/contact'];
    const page = pages[Math.floor(Math.random() * pages.length)];

    const res = http.post(
      `${API_URL}/analytics/pageview`,
      JSON.stringify({ path: page }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    check(res, {
      'pageview recorded': (r) => r.status === 200 || r.status === 201,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(1);

  group('Login Endpoint (rate limited)', () => {
    // Test rate limiting — use invalid creds
    const res = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({
        email: 'loadtest@example.com',
        password: 'invalid-password',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    check(res, {
      'login returns 401 or 429': (r) =>
        r.status === 401 || r.status === 429,
    });
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  // k6 built-in text summary
  return JSON.stringify(data.metrics, null, 2);
}
