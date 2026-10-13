(() => {
  'use strict';
  const match = /^#formlive=([a-z0-9]{6,16})%3A([0-9]+)$/i.exec(location.hash)
    || /^#formlive=([a-z0-9]{6,16}):([0-9]+)$/i.exec(location.hash);
  if (!match) return;
  const formId = match[1], questionIndex = Number(match[2]);
  if (!Number.isSafeInteger(questionIndex) || questionIndex < 0 || questionIndex > 500) return;
  const panel = document.createElement('div');
  panel.style.cssText = 'position:sticky;top:0;z-index:1001;padding:12px 16px;background:#fff;color:#171923;font:600 14px system-ui,sans-serif;border-bottom:2px solid #d4d8e5;display:flex;flex-wrap:wrap;align-items:center;gap:10px;';
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  status.textContent = 'Form 실시간 돌림판 · 연결 준비 중';
  const stop = document.createElement('button');
  stop.textContent = '실시간 연동 종료';
  stop.style.cssText = 'margin-left:auto;padding:8px 12px;border:1px solid #aaa;border-radius:9px;background:white;color:#171923;cursor:pointer;';
  panel.append(status, stop);
  document.body.prepend(panel);
  let query = null, handler = null, pending = null, retryTimer = null, active = true;
  function detach() {
    active = false;
    if (retryTimer) clearTimeout(retryTimer);
    if (query && handler) query.off('value', handler);
    stop.disabled = true;
    status.textContent = '실시간 연동이 종료됐어요. 현재 돌림판은 그대로 유지됩니다.';
  }
  stop.addEventListener('click', detach);
  window.addEventListener('pagehide', detach, { once: true });
  function entriesFromSnapshot(data) {
    const groups = new Map();
    Object.entries(data || {}).forEach(([key, response]) => {
      if (!key.startsWith('frm:' + formId + ':resp:')) return;
      const value = response && response.answers && response.answers[questionIndex];
      if (typeof value !== 'string') return;
      const label = value.trim().replace(/\s+/g, ' ').slice(0, 200);
      if (!label) return;
      const lower = label.toLocaleLowerCase();
      const record = groups.get(lower);
      if (record) record.weight = Math.min(1000000, record.weight + 1);
      else groups.set(lower, { label, weight: 1 });
    });
    return Array.from(groups.values());
  }
  function apply() {
    if (!active || !pending) return;
    if (!window.FormwheelLiveBridge || !window.FormwheelLiveBridge.update(pending)) {
      retryTimer = setTimeout(apply, 600);
      return;
    }
    const answerCount = pending.reduce((n, item) => n + item.weight, 0);
    status.textContent = '● Form 실시간 연결됨 · ' + pending.length + '개 항목 / ' + answerCount + '개 응답';
    pending = null;
  }
  if (!window.confirm('Form의 새 응답으로 돌림판을 실시간 동기화할까요? 현재 Wheel 항목이 교체됩니다.')) {
    panel.remove();
    return;
  }
  if (typeof firebase === 'undefined' || typeof firebase.database !== 'function') {
    status.textContent = 'Firebase를 불러오지 못했어요. 연결을 확인해주세요.';
    return;
  }
  try {
    const config = {
      apiKey: 'AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE',
      authDomain: 'formwheel.firebaseapp.com',
      databaseURL: 'https://formwheel-default-rtdb.firebaseio.com/',
      projectId: 'formwheel',
      appId: '1:431583088241:web:74e0e34ea1e3e1170c55d0'
    };
    const app = firebase.apps.find(item => item.name === 'formwheel-live') ||
      firebase.initializeApp(config, 'formwheel-live');
    const db = app.database();
    db.ref('data/frm:' + formId + ':meta').once('value').then(snap => {
      if (!active) return;
      const form = snap.val();
      if (!form || !Array.isArray(form.questions) || !form.questions[questionIndex] ||
          form.questions[questionIndex].type !== 'text') {
        status.textContent = '유효한 주관식 설문을 찾지 못했어요.';
        detach();
        return;
      }
      const prefix = 'frm:' + formId + ':resp:';
      query = db.ref('data').orderByKey().startAt(prefix).endAt(prefix + '\uf8ff');
      handler = snapshot => {
        if (!active) return;
        pending = entriesFromSnapshot(snapshot.val());
        apply();
      };
      query.on('value', handler, err => {
        status.textContent = '실시간 응답을 읽을 수 없어요: ' + (err.code || '권한/연결 오류');
      });
    }).catch(err => {
      status.textContent = '설문을 불러오지 못했어요: ' + (err.code || '연결 오류');
    });
  } catch (err) { status.textContent = '실시간 연결 초기화 실패'; }
})();
