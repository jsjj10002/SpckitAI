/**
 * Builder 페이지 메인 스크립트
 * 채팅, 부품 추천, 선택 기능 등을 관리한다
 */

import { getPCRecommendation, extractPrice, formatPrice } from './api.js';

// DOM 요소
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const terminalContent = document.getElementById('terminal-content'); // 추천 부품 (터미널)
const fileList = document.getElementById('file-list'); // 선택된 부품 (파일 트리)
const homeBtn = document.getElementById('home-btn');

// 상태 관리
let selectedParts = [];
let isLoading = false;
let chatHistory = [];

/**
 * 초기화
 */
function init() {
  // URL 파라미터에서 초기 메시지 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const initialMessage = urlParams.get('message');
  
  if (initialMessage) {
    handleSendMessage(initialMessage);
  }

  // 이벤트 리스너 등록
  sendBtn.addEventListener('click', handleSendClick);
  chatInput.addEventListener('keydown', handleKeyDown);
  homeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

/**
 * 전송 버튼 클릭 핸들러
 */
function handleSendClick() {
  const message = chatInput.value.trim();
  if (message && !isLoading) {
    handleSendMessage(message);
    chatInput.value = '';
  }
}

/**
 * 키보드 이벤트 핸들러 (Enter로 전송)
 */
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendClick();
  }
}

/**
 * 메시지 전송 및 AI 응답 처리
 */
async function handleSendMessage(message) {
  if (isLoading) return;
  
  isLoading = true;
  updateSendButtonState();

  // 사용자 메시지 추가
  addMessage(message, 'user');
  chatHistory.push({ role: 'user', text: message });

  // AI 로딩 표시
  const loadingMessage = addMessage('', 'ai', true);

  try {
    // AI 응답 받기
    const response = await getPCRecommendation(message);
    
    // 로딩 메시지 제거
    loadingMessage.remove();

    // AI 분석 메시지 추가 (타이핑 효과)
    await addMessageWithTyping(response.analysis, 'ai');
    chatHistory.push({ role: 'model', text: response.analysis });

    // 추천 부품 표시
    displayRecommendations(response.components);

  } catch (error) {
    console.error('메시지 전송 오류:', error);
    loadingMessage.remove();
    addMessage(error.message || '오류가 발생했습니다', 'error');
  } finally {
    isLoading = false;
    updateSendButtonState();
  }
}

/**
 * 채팅 메시지 추가
 */
function addMessage(text, type = 'user', isLoading = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;

  if (type === 'ai') {
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
      <svg class="icon-bolt-small" width="40" height="14" viewBox="0 0 40 14" fill="currentColor">
        <text x="0" y="12" font-size="14" font-family="Inter" font-weight="700">Spckit AI</text>
      </svg>
    `;
    messageDiv.appendChild(header);
  }

  if (isLoading) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'thinking-indicator';
    loadingDiv.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 18 18">
        <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
      </svg>
      <span class="thinking-text">Thinking...</span>
    `;
    messageDiv.appendChild(loadingDiv);
  } else {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    messageDiv.appendChild(bubble);
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageDiv;
}

/**
 * 타이핑 효과로 메시지 추가
 */
async function addMessageWithTyping(text, type = 'ai') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;

  if (type === 'ai') {
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
      <svg class="icon-bolt-small" width="40" height="14" viewBox="0 0 40 14" fill="currentColor">
        <text x="0" y="12" font-size="14" font-family="Inter" font-weight="700">Spckit AI</text>
      </svg>
    `;
    messageDiv.appendChild(header);
  }

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  messageDiv.appendChild(bubble);

  chatMessages.appendChild(messageDiv);

  // 타이핑 애니메이션
  let charIndex = 0;
  const typingSpeed = 10; // ms per character

  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (charIndex < text.length) {
        bubble.textContent = text.substring(0, charIndex + 1);
        charIndex++;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        clearInterval(intervalId);
        resolve();
      }
    }, typingSpeed);
  });
}

/**
 * 추천 부품 표시 (터미널 스타일)
 */
function displayRecommendations(components) {
  terminalContent.innerHTML = '';

  if (!components || components.length === 0) {
    terminalContent.innerHTML = '<div class="terminal-line">추천 부품이 없습니다</div>';
    return;
  }

  components.forEach((component, index) => {
    const line = createTerminalLine(component);
    terminalContent.appendChild(line);
  });
}

/**
 * 터미널 라인 생성 (원본 디자인 스타일)
 */
function createTerminalLine(component) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.style.cursor = 'pointer';
  line.style.padding = '8px';
  line.style.borderRadius = '4px';
  line.style.marginBottom = '4px';
  
  line.innerHTML = `
    <span class="arrow">➜</span> 
    <span class="bold">${component.category}</span>: 
    ${component.name} - 
    <span class="link">${component.price}</span>
    ${component.features.length > 0 ? `<span style="color: var(--color-text-muted); margin-left: 8px;">(${component.features.slice(0, 2).join(', ')})</span>` : ''}
  `;
  
  // 호버 효과
  line.addEventListener('mouseenter', () => {
    line.style.background = 'rgba(255, 255, 255, 0.05)';
  });
  
  line.addEventListener('mouseleave', () => {
    line.style.background = 'transparent';
  });
  
  // 클릭 이벤트 - 부품 선택
  line.addEventListener('click', () => {
    selectPart(component);
    line.style.background = 'rgba(90, 247, 142, 0.1)';
    setTimeout(() => {
      line.style.background = 'transparent';
    }, 300);
  });
  
  return line;
}

/**
 * 부품 선택
 */
function selectPart(component) {
  // 같은 카테고리 부품이 이미 있으면 교체
  const existingIndex = selectedParts.findIndex(p => p.category === component.category);
  
  if (existingIndex !== -1) {
    selectedParts[existingIndex] = component;
  } else {
    selectedParts.push(component);
  }
  
  updateSelectedParts();
}

/**
 * 선택된 부품 표시 업데이트 (파일 트리 스타일)
 */
function updateSelectedParts() {
  fileList.innerHTML = '';
  
  if (selectedParts.length === 0) {
    fileList.innerHTML = '<div class="file-item" style="color: var(--color-text-muted); padding: 8px;">선택된 부품이 없습니다</div>';
    return;
  }
  
  selectedParts.forEach((component, index) => {
    const item = createFileItem(component, index);
    fileList.appendChild(item);
  });
  
  // 총 가격 표시
  const totalLine = document.createElement('div');
  totalLine.className = 'file-item';
  totalLine.style.borderTop = '1px solid var(--color-border)';
  totalLine.style.marginTop = '8px';
  totalLine.style.paddingTop = '8px';
  totalLine.style.fontWeight = '700';
  totalLine.innerHTML = `
    <span style="color: var(--color-success);">총 예상 가격:</span>
    <span style="color: var(--color-link); margin-left: 8px;">${calculateTotal()}</span>
  `;
  fileList.appendChild(totalLine);
}

/**
 * 파일 아이템 생성 (파일 트리 스타일 - 원본 디자인)
 */
function createFileItem(component, index) {
  const item = document.createElement('div');
  item.className = 'file-item';
  item.style.display = 'flex';
  item.style.alignItems = 'center';
  item.style.justifyContent = 'space-between';
  item.style.padding = '6px 8px';
  
  const leftSection = document.createElement('div');
  leftSection.style.flex = '1';
  leftSection.style.overflow = 'hidden';
  
  const categorySpan = document.createElement('span');
  categorySpan.style.color = 'var(--color-success)';
  categorySpan.style.fontWeight = '500';
  categorySpan.style.marginRight = '8px';
  categorySpan.textContent = `[${component.category}]`;
  
  const nameSpan = document.createElement('span');
  nameSpan.style.color = 'var(--color-text-secondary)';
  nameSpan.textContent = component.name;
  
  leftSection.appendChild(categorySpan);
  leftSection.appendChild(nameSpan);
  
  const rightSection = document.createElement('div');
  rightSection.style.display = 'flex';
  rightSection.style.alignItems = 'center';
  rightSection.style.gap = '8px';
  
  const priceSpan = document.createElement('span');
  priceSpan.style.color = 'var(--color-link)';
  priceSpan.style.fontSize = 'var(--font-size-xs)';
  priceSpan.textContent = component.price;
  
  const removeBtn = document.createElement('button');
  removeBtn.style.padding = '2px 6px';
  removeBtn.style.borderRadius = '4px';
  removeBtn.style.background = 'transparent';
  removeBtn.style.border = 'none';
  removeBtn.style.color = 'var(--color-text-muted)';
  removeBtn.style.cursor = 'pointer';
  removeBtn.style.fontSize = '16px';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('mouseenter', () => {
    removeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    removeBtn.style.color = 'var(--color-text-primary)';
  });
  removeBtn.addEventListener('mouseleave', () => {
    removeBtn.style.background = 'transparent';
    removeBtn.style.color = 'var(--color-text-muted)';
  });
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removePart(index);
  });
  
  rightSection.appendChild(priceSpan);
  rightSection.appendChild(removeBtn);
  
  item.appendChild(leftSection);
  item.appendChild(rightSection);
  
  return item;
}

/**
 * 부품 제거
 */
function removePart(index) {
  selectedParts.splice(index, 1);
  updateSelectedParts();
}

/**
 * 총 가격 계산
 */
function calculateTotal() {
  const total = selectedParts.reduce((sum, part) => {
    return sum + extractPrice(part.price);
  }, 0);
  
  return formatPrice(total);
}

/**
 * 전송 버튼 상태 업데이트
 */
function updateSendButtonState() {
  sendBtn.disabled = isLoading;
  sendBtn.style.opacity = isLoading ? '0.5' : '1';
  sendBtn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
}

// 초기화 실행
init();
