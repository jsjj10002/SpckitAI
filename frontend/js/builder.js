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
const startBuildBtn = document.getElementById('start-build-btn');
const nextStepBtn = document.getElementById('next-step-btn');
const terminalLoading = document.getElementById('terminal-loading');
const terminalLoadingText = document.getElementById('terminal-loading-text');

// 상태 관리
let selectedParts = [];
let isLoading = false;
let chatHistory = [];

// 빌드 상태 관리
let currentPhase = 'requirements'; // 'requirements' | 'building'
let buildStageIndex = 0;
const BUILD_STAGES = ['CPU', 'Mainboard', 'RAM', 'GPU', 'SSD', 'Power', 'Case', 'Cooler'];

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
  
  // Start Build 버튼 리스너
  if (startBuildBtn) {
    startBuildBtn.addEventListener('click', startBuildProcess);
  }

  // Next Step 버튼 리스너
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', handleNextStep);
  }
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

  // 요구사항 분석 단계일 때만 일반 채팅 응답
  if (currentPhase === 'requirements') {
      const loadingMessage = addMessage('', 'ai', true);
      
      try {
        // 일반적인 요구사항 수집 대화 (카테고리 없이 호출)
        // 주의: 현재 API 구조상 항상 추천 결과를 반환하려고 시도함.
        // 챗봇 모드와 추천 모드를 구분하는 것이 좋으나, 
        // 여기서는 'category' 파라미터 없이 호출하여 자연스러운 대화를 유도하거나
        // 백엔드 프롬프트를 조정하여 "아직 부품 추천 전이면 질문만 하세요"라고 해야 함.
        // 우선 기존 getPCRecommendation 사용하되, UI에는 텍스트만 표시.
        
        const response = await getPCRecommendation(message);
        
        stopDynamicLoadingText();
        loadingMessage.remove();

        await addMessageWithTyping(response.analysis, 'ai');
        chatHistory.push({ role: 'model', text: response.analysis });
        
        // 1단계에서는 부품 추천 리스트를 보여주지 않음 (Chat Only)

      } catch (error) {
        console.error('메시지 전송 오류:', error);
        stopDynamicLoadingText();
        loadingMessage.remove();
        addMessage(error.message || '오류가 발생했습니다', 'error');
      } finally {
        isLoading = false;
        updateSendButtonState();
      }
  } else {
      // 빌드 단계에서의 채팅 (추가 질문 등)
      // 여기서는 현재 단계의 부품에 대한 질문일 수 있음
      const loadingMessage = addMessage('', 'ai', true);
      try {
          // 현재 단계의 컨텍스트를 포함하여 질의
          const currentStage = BUILD_STAGES[buildStageIndex];
          const response = await getPCRecommendation(message, { category: currentStage });
          
          stopDynamicLoadingText();
          loadingMessage.remove();
          
          await addMessageWithTyping(response.analysis, 'ai');
          chatHistory.push({ role: 'model', text: response.analysis });
          
          // 부품 리스트 업데이트 (사용자가 원해서 검색했을 수도 있으므로)
          if (response.components && response.components.length > 0) {
              displayRecommendations(response.components);
          }

      } catch (error) {
        console.error('오류:', error);
        stopDynamicLoadingText();
        loadingMessage.remove();
        addMessage('처리 중 오류가 발생했습니다.', 'error');
      } finally {
        isLoading = false;
        updateSendButtonState();
      }
  }
}

/**
 * 빌드 프로세스 시작 (Plan/Start 버튼 클릭 시)
 */
async function startBuildProcess() {
    if (currentPhase === 'building') return; // 이미 진행 중이면 무시

    currentPhase = 'building';
    buildStageIndex = 0; // CPU부터 시작
    
    // UI 업데이트
    addMessageWithTyping("네, 알겠습니다. 이제 본격적으로 부품을 하나씩 맞춰볼까요? 먼저 **CPU**부터 살펴보겠습니다.", 'ai');
    
    // 첫 단계 부품 로드
    await loadStageComponents(BUILD_STAGES[buildStageIndex]);
}

/**
 * 특정 단계(Category)의 부품 로드
 */
async function loadStageComponents(stage) {
    if (!stage) return;

    // 터미널 로딩 표시
    showTerminalLoading(`Searching for ${stage}...`);
    terminalContent.innerHTML = ''; // 기존 리스트 초기화

    try {
        // 사용자 요구사항(채팅 히스토리)을 기반으로 해당 카테고리 추천 요청
        // 최근 채팅 내용을 합쳐서 쿼리로 보낼 수도 있고, 
        // 백엔드가 히스토리를 관리하지 않는다면 마지막 사용자 메시지나 요약된 요구사항을 보내야 함.
        // 여기서는 간단히 "Recommend ${stage} for my build" 형태로 쿼리 전송
        // 실제로는 chatHistory를 분석하거나 마지막 유저 입력을 활용해야 더 정확함.
        // 편의상 가장 최근 유저 메시지 + 카테고리 조합 사용
        
        const lastUserMsg = chatHistory.filter(m => m.role === 'user').pop()?.text || "가성비 좋은 PC";
        const query = `${lastUserMsg}`; 

        const response = await getPCRecommendation(query, { category: stage });

        hideTerminalLoading();
        
        // 추천 목록 표시
        displayRecommendations(response.components);
        
        // 선택된 부품이 있다면 표시 (이전 단계에서 돌아왔을 때 등)
        highlightSelectedInRecommendation();

    } catch (error) {
        console.error(`Failed to load ${stage}:`, error);
        hideTerminalLoading();
        terminalContent.innerHTML = `<div class="terminal-line error">Failed to load ${stage} recommendations.</div>`;
    }
}

/**
 * 다음 단계로 이동 (Next Step 버튼)
 */
async function handleNextStep() {
    // 현재 단계에서 선택된 부품이 있는지 확인 (선택사항: 강제할지 말지)
    const currentStage = BUILD_STAGES[buildStageIndex];
    const isSelected = selectedParts.some(p => p.category.toLowerCase().includes(currentStage.toLowerCase()));

    if (!isSelected) {
        // 선택 안 했으면 경고? 혹은 그냥 넘어가기?
        // 여기서는 안내 메시지 출력 후 넘어감
        await addMessageWithTyping(`${currentStage}를 선택하지 않으셨네요. 다음 단계로 넘어갑니다.`, 'ai');
    } else {
        await addMessageWithTyping(`${currentStage} 선택 완료! 다음 부품을 보시죠.`, 'ai');
    }

    buildStageIndex++;

    if (buildStageIndex >= BUILD_STAGES.length) {
        await addMessageWithTyping("모든 부품 선택이 완료되었습니다! 견적을 확인해보세요.", 'ai');
        terminalContent.innerHTML = '<div class="terminal-line success">All steps completed! Check your build summary.</div>';
        return;
    }

    const nextStage = BUILD_STAGES[buildStageIndex];
    await addMessageWithTyping(`다음은 **${nextStage}**입니다.`, 'ai');
    await loadStageComponents(nextStage);
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
        <path d="M9 2a7 7 0 0 1 7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />
      </svg>
      <span class="thinking-text">분석 중...</span>
    `;
    messageDiv.appendChild(loadingDiv);

    // 동적 로딩 텍스트 시작
    startDynamicLoadingText(messageDiv.querySelector('.thinking-text'));

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
 * 동적 로딩 텍스트 애니메이션 (멀티 에이전트 시뮬레이션)
 */
let loadingInterval;
function startDynamicLoadingText(element) {
  const steps = [
    "요구사항 분석 중...",
    "부품 데이터베이스 검색 중...",
    "호환성 체크 에이전트 실행 중...",
    "가격 효율성 분석 중...",
    "최적의 견적 생성 중..."
  ];
  let index = 0;

  // 초기 텍스트 설정
  element.textContent = steps[0];

  if (loadingInterval) clearInterval(loadingInterval);

  loadingInterval = setInterval(() => {
    index = (index + 1) % steps.length;
    
    // 텍스트 변경 애니메이션
    element.style.opacity = '0';
    element.style.transform = 'translateY(5px)';
    
    setTimeout(() => {
      element.textContent = steps[index];
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 300);

  }, 2500); // 2.5초 간격
}

function stopDynamicLoadingText() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
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
  chatMessages.scrollTop = chatMessages.scrollHeight;

  let charIndex = 0;
  const typingSpeed = 15; // ms per character

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
  // 로딩 중이 아닐 때만 내용 지우기 (중복 방지)
  if (!terminalLoading.style.display || terminalLoading.style.display === 'none') {
      terminalContent.innerHTML = '';
  }

  if (!components || components.length === 0) {
    terminalContent.innerHTML = '<div class="terminal-line">추천 부품이 없습니다</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'recommendation-list';

  components.forEach((component, index) => {
    const card = createRecommendationCard(component);
    // 순차적 등장 애니메이션 딜레이
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('animate-in');
    
    // 이미 선택된 부품인지 확인하여 스타일 적용
    const isSelected = selectedParts.some(p => p.name === component.name && p.category === component.category);
    if (isSelected) {
        card.classList.add('selected');
        card.style.opacity = '0.5'; // 선택된 것은 흐리게
    }

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
  // 데이터 속성으로 식별자 저장 (재선택/해제용)
  card.dataset.name = component.name;
  card.dataset.category = component.category;

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
  card.addEventListener('click', (e) => {
    // 이미 선택된 경우 무시하거나 해제 로직을 넣을 수 있음
    if (card.classList.contains('selected')) return;
    
    handleCardClick(e, card, component);
  });

  return card;
}

/**
 * 카드 클릭 핸들러 (애니메이션 + 선택 로직)
 */
function handleCardClick(e, cardElement, component) {
  // 1. 쑤욱 들어가는 애니메이션 (Fly Effect)
  const rect = cardElement.getBoundingClientRect();
  const targetRect = fileList.getBoundingClientRect();

  const flyingElement = cardElement.cloneNode(true);
  flyingElement.classList.add('flying-element');
  flyingElement.style.width = `${rect.width}px`;
  flyingElement.style.height = `${rect.height}px`;
  flyingElement.style.left = `${rect.left}px`;
  flyingElement.style.top = `${rect.top}px`;
  flyingElement.style.margin = '0';
  flyingElement.classList.remove('animate-in'); // 등장 애니메이션 제거

  document.body.appendChild(flyingElement);

  // 애니메이션 실행
  requestAnimationFrame(() => {
    flyingElement.style.left = `${targetRect.left + 20}px`; // 타겟 위치로 이동
    flyingElement.style.top = `${targetRect.top + targetRect.height / 2}px`; // 타겟 중앙쯤으로
    flyingElement.style.transform = 'scale(0.2) opacity(0)';
    flyingElement.style.opacity = '0';
  });

  // 2. 원본 카드는 선택 상태로 변경 (숨기지 않고 흐리게 처리 or 체크 표시)
  // 기획 의도: "선택된 리스트 창으로 쑤욱 들어가서 선택 추천 창에는 없고"
  // -> Slide Out 후 display: none
  cardElement.style.transform = 'translateX(100px)';
  cardElement.style.opacity = '0';
  setTimeout(() => {
    cardElement.style.display = 'none'; 
    cardElement.classList.add('selected'); // 상태 마킹
  }, 300);

  // 3. 애니메이션 종료 후 실제 데이터 처리
  setTimeout(() => {
    flyingElement.remove();
    selectPart(component);
  }, 600);
}

/**
 * 부품 선택 및 상태 업데이트
 */
function selectPart(component) {
  // 같은 카테고리 부품이 이미 있으면 교체
  const existingIndex = selectedParts.findIndex(p => p.category === component.category);

  if (existingIndex !== -1) {
      // 기존 부품이 있으면, 그 부품을 추천 리스트(Panel 2)에 다시 복구해야 하는지?
      // 현재 로직상 Panel 2는 API 결과를 그대로 보여주므로, 
      // 복잡성을 줄이기 위해 단순히 교체만 진행.
      // UX적으로 교체된 이전 부품이 다시 나타나는건 구현이 까다로움(DOM이 사라졌으므로).
      // 일단 교체.
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
    fileList.innerHTML = '<div class="file-item" style="color: var(--color-text-muted); padding: 8px;">No parts selected</div>';
    return;
  }

  // 카테고리 순서대로 정렬
  selectedParts.sort((a, b) => {
    const idxA = CATEGORY_ORDER.findIndex(c => a.category.includes(c));
    const idxB = CATEGORY_ORDER.findIndex(c => b.category.includes(c));
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

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
    <span style="color: var(--color-success);">Total:</span>
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
  item.dataset.index = index; 

  const leftSection = document.createElement('div');
  leftSection.style.flex = '1';
  leftSection.style.overflow = 'hidden';
  leftSection.style.display = 'flex';
  leftSection.style.alignItems = 'center';

  const categorySpan = document.createElement('span');
  categorySpan.style.color = 'var(--color-success)';
  categorySpan.style.fontWeight = '500';
  categorySpan.style.marginRight = '8px';
  categorySpan.style.fontSize = '12px';
  categorySpan.textContent = `[${component.category}]`;

  const nameSpan = document.createElement('span');
  nameSpan.style.color = 'var(--color-text-secondary)';
  nameSpan.style.fontSize = '13px';
  nameSpan.textContent = component.name;
  nameSpan.style.whiteSpace = 'nowrap';
  nameSpan.style.overflow = 'hidden';
  nameSpan.style.textOverflow = 'ellipsis';

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
  
  // 삭제 버튼 클릭 핸들러
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    item.classList.add('removing');
    item.addEventListener('animationend', () => {
      // 삭제 시 Panel 2에 해당 부품이 있다면 다시 보이게 처리
      restoreRecommendationCard(component);
      removePart(index);
    }, { once: true });
  });

  rightSection.appendChild(priceSpan);
  rightSection.appendChild(removeBtn);

  item.appendChild(leftSection);
  item.appendChild(rightSection);

  return item;
}

/**
 * 추천 카드 복구 (삭제 시)
 */
function restoreRecommendationCard(component) {
    const cards = terminalContent.querySelectorAll('.recommendation-card');
    cards.forEach(card => {
        if (card.dataset.name === component.name && card.dataset.category === component.category) {
            card.style.display = 'flex'; // 다시 보이기
            card.style.opacity = '0';
            card.style.transform = 'translateX(0)';
            card.classList.remove('selected');
            
            // 페이드 인
            requestAnimationFrame(() => {
                card.style.opacity = '1';
            });
        }
    });
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

/**
 * 터미널 로딩 표시 (멀티 에이전트 느낌)
 */
function showTerminalLoading(text) {
    if (terminalLoading) {
        terminalLoading.style.display = 'flex';
        terminalLoadingText.textContent = text;
    }
}

function hideTerminalLoading() {
    if (terminalLoading) {
        terminalLoading.style.display = 'none';
    }
}

/**
 * 추천 목록에서 선택된 항목 하이라이트 (재로드 시)
 */
function highlightSelectedInRecommendation() {
    // displayRecommendations 안에서 이미 처리함
}

// 초기화 실행
init();
