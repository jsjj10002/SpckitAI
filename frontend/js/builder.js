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

// 아이콘 정의
const COMPONENT_ICONS = {
  'CPU': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
  'GPU': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="11" cy="12" r="2"/><circle cx="17" cy="12" r="2"/><path d="M2 10h4v4H2z"/></svg>',
  'RAM': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16h20V4H2zm4 16V4m4 16V4m4 16V4m4 16V4"/></svg>',
  'SSD': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M6 10h12M6 14h12"/></svg>',
  'Mainboard': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h2v2H8zm4 0h4v4h-4zM8 14h2v2H8z"/></svg>',
  'Power': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 12h.01"/><circle cx="12" cy="12" r="4"/></svg>',
  'Case': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 6h4"/></svg>',
  'Cooler': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg>',
  'Default': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
};

/**
 * 추천 부품 표시 (카드 스타일)
 */
function displayRecommendations(components) {
  terminalContent.innerHTML = '';

  if (!components || components.length === 0) {
    terminalContent.innerHTML = '<div class="terminal-line">추천 부품이 없습니다</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'recommendation-list';

  components.forEach((component) => {
    const card = createRecommendationCard(component);
    list.appendChild(card);
  });

  terminalContent.appendChild(list);
}

/**
 * 추천 카드 생성
 */
function createRecommendationCard(component) {
  const card = document.createElement('div');
  card.className = 'recommendation-card';
  
  // 카테고리 대소문자 처리 및 매핑
  const categoryKey = Object.keys(COMPONENT_ICONS).find(key => 
    component.category.toLowerCase().includes(key.toLowerCase())
  ) || 'Default';
  
  const iconSvg = COMPONENT_ICONS[categoryKey];

  // 해시태그 처리 (hashtags가 없으면 features 사용)
  const tags = component.hashtags && component.hashtags.length > 0 
    ? component.hashtags 
    : (component.features || []);

  const tagsHtml = tags
    .slice(0, 3) // 최대 3개
    .map(tag => {
       const text = tag.startsWith('#') ? tag : `#${tag}`;
       return `<span class="tag">${text}</span>`;
    })
    .join('');

  card.innerHTML = `
    <div class="card-header">
      <div class="card-icon">${iconSvg}</div>
      <div class="card-info">
        <div class="card-category">${component.category}</div>
        <div class="card-name" title="${component.name}">${component.name}</div>
      </div>
    </div>
    <div class="card-details">
      <div class="card-tags">
        ${tagsHtml}
      </div>
      <div class="card-price">${component.price}</div>
    </div>
  `;
  
  // 클릭 이벤트 - 부품 선택
  card.addEventListener('click', () => {
    selectPart(component);
    
    // 선택 효과
    card.classList.add('selected');
    setTimeout(() => card.classList.remove('selected'), 500);
  });
  
  return card;
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
  
  // 다음 단계 제안 (꼬리 질문)
  triggerNextStep(component);
}

/**
 * 다음 단계 제안 (꼬리 질문)
 */
function triggerNextStep(component) {
  const category = component.category.toLowerCase();
  let nextMessage = '';

  // 부품 선택 순서 로직
  if (category.includes('cpu')) {
    nextMessage = `CPU로 **${component.name}**을(를) 선택하셨군요! \n이 CPU와 호환되는 **메인보드**를 추천해 드릴까요?`;
  } else if (category.includes('board') || category.includes('메인보드')) {
     nextMessage = `메인보드를 선택하셨습니다. 이제 **메모리(RAM)**를 골라볼까요?`;
  } else if (category.includes('ram') || category.includes('메모리')) {
     nextMessage = `메모리 선택 완료! 다음으로 **그래픽카드(GPU)**는 어떠신가요?`;
  } else if (category.includes('gpu') || category.includes('그래픽')) {
     nextMessage = `그래픽카드까지 고르셨네요. **SSD(저장장치)**나 **케이스**를 보러 갈까요?`;
  } else if (category.includes('ssd') || category.includes('저장')) {
     nextMessage = `저장장치도 준비되었습니다. 이제 **파워서플라이**나 **케이스**를 선택해 보세요.`;
  } else {
     nextMessage = `**${component.name}**이(가) 목록에 추가되었습니다. \n다음으로 어떤 부품을 찾으시나요?`;
  }

  // AI 메시지로 추가
  addMessageWithTyping(nextMessage, 'ai');
  chatHistory.push({ role: 'model', text: nextMessage });
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
