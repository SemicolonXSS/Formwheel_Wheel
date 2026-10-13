import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const config = {
  apiKey: 'AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE',
  authDomain: 'formwheel.firebaseapp.com',
  databaseURL: 'https://formwheel-default-rtdb.firebaseio.com',
  projectId: 'formwheel',
  appId: '1:431583088241:web:74e0e34ea1e3e1170c55d0'
};
const app = getApps().find(app => app.name === '[DEFAULT]') || initializeApp(config);
const auth = getAuth(app);
let current = null;
function emit(user) {
  current = user;
  window.dispatchEvent(new CustomEvent('fw:wheel:auth', {
    detail: user ? {uid: user.uid, anonymous: user.isAnonymous, displayName: user.displayName || user.email || '회원'} : {}
  }));
}
onAuthStateChanged(auth, emit, error => {
  console.error('Formwheel ID 상태 확인 실패', error);
});
window.addEventListener('fw:wheel:login', async () => {
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (error) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(error.code))
      await signInWithRedirect(auth, new GoogleAuthProvider());
    else alert('Formwheel ID 로그인 실패: ' + (error.code || '네트워크를 확인해주세요.'));
  }
});
window.addEventListener('fw:wheel:logout', async () => {
  try { await signOut(auth); }
  catch (error) { alert('로그아웃 실패: ' + (error.code || '연결을 확인해주세요.')); }
});
getRedirectResult(auth).catch(error => console.error('Formwheel ID 로그인 복귀 실패', error));
