/**
 * Landing 페이지 스크립트
 * 초기 화면에서 메시지 입력 후 builder 페이지로 전환
 */

// DOM 요소
const chatInput = document.getElementById('landing-chat-input');
const sendBtn = document.getElementById('landing-send-btn');

/**
 * 초기화
 */
function init() {
  // 이벤트 리스너 등록
  sendBtn.addEventListener('click', handleSendClick);
  chatInput.addEventListener('keydown', handleKeyDown);
  
  // 입력 포커스
  chatInput.focus();
}

/**
 * 전송 버튼 클릭 핸들러
 */
function handleSendClick() {
  const message = chatInput.value.trim();
  if (message) {
    navigateToBuilder(message);
  }
}

/**
 * 키보드 이벤트 핸들러 (Enter로 전송)
 */
function handleKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSendClick();
  }
}

/**
 * Builder 페이지로 이동
 * @param {string} message - 사용자 메시지
 */
function navigateToBuilder(message) {
  // URL 파라미터로 메시지 전달
  const url = new URL('builder.html', window.location.origin + window.location.pathname.replace('index.html', ''));
  url.searchParams.set('message', message);
  window.location.href = url.toString();
}

// 초기화 실행
init();

