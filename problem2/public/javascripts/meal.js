// 급식 정보 조회
async function searchMeals() {
  const schoolName = document.getElementById('schoolName').value.trim();
  if (!schoolName) {
    alert('학교 이름을 입력해주세요.');
    return;
  }
  
  const monthInput = document.getElementById('month').value;
  let startDate = '';
  let endDate = '';
  
  if (monthInput) {
    const [year, month] = monthInput.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    startDate = `${year}${month}01`;
    endDate = `${year}${month}${lastDay}`;
  }
  
  // 로딩 표시
  document.getElementById('loading').style.display = 'block';
  document.getElementById('result').style.display = 'none';
  
  try {
    let url = `/api/meals/schoolMealAndAllergy?schoolName=${encodeURIComponent(schoolName)}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    // 로딩 숨기기
    document.getElementById('loading').style.display = 'none';
    
    if (!data.success) {
      alert(data.message || '급식 정보를 가져오는데 실패했습니다.');
      return;
    }
    
    if (!data.data || data.data.length === 0) {
      alert(data.message || '해당 기간에 급식 정보가 없습니다.');
      return;
    }
    
    // 결과 표시
    renderResult(data);
  } catch (error) {
    document.getElementById('loading').style.display = 'none';
    alert('급식 정보를 가져오는데 실패했습니다.');
    console.error(error);
  }
}

// 결과 렌더링
function renderResult(data) {
  const schoolInfo = document.getElementById('schoolInfo');
  const weeklyContainer = document.getElementById('weeklyContainer');
  
  // 학교 정보
  schoolInfo.innerHTML = `
    <h2>${data.schoolInfo.name}</h2>
    <p>교육청: ${data.schoolInfo.officeName} | 주소: ${data.schoolInfo.address}</p>
  `;
  
  // 날짜 범위 정보
  if (data.data.length > 0) {
    const startDate = data.data[0].date;
    const endDate = data.data[data.data.length - 1].date;
    
    const dateRangeElement = document.createElement('div');
    dateRangeElement.className = 'date-range';
    dateRangeElement.textContent = `${startDate} ~ ${endDate} 기간 급식 정보`;
    schoolInfo.appendChild(dateRangeElement);
  }
  
  // 탭 버튼 생성
  const tabContainer = document.createElement('div');
  tabContainer.className = 'meal-tabs';
  
  const tabs = ['조식', '중식', '석식'];
  tabs.forEach((tab, index) => {
    const tabButton = document.createElement('button');
    tabButton.className = `tab-button ${index === 1 ? 'active' : ''}`;
    tabButton.textContent = tab;
    tabButton.onclick = () => switchTab(tab);
    tabContainer.appendChild(tabButton);
  });
  
  schoolInfo.appendChild(tabContainer);
  
  // 급식 정보를 타입별로 분류
  const mealsByType = {
    '조식': [],
    '중식': [],
    '석식': []
  };
  
  // 날짜별 데이터 정리
  const dateMap = {};
  data.data.forEach(day => {
    const dayDate = day.date;
    const dayOfWeek = day.dayOfWeek;
    
    // 날짜별 데이터 초기화
    if (!dateMap[dayDate]) {
      dateMap[dayDate] = {
        date: dayDate,
        dayOfWeek: dayOfWeek,
        meals: {}
      };
    }
    
    // 급식 정보 추가
    if (day.meals && day.meals.length > 0) {
      day.meals.forEach(meal => {
        const type = meal.type;
        dateMap[dayDate].meals[type] = {
          menu: meal.menu,
          allergies: meal.allergies
        };
      });
    }
  });
  
  // 날짜 정렬
  const sortedDates = Object.keys(dateMap).sort();
  
  // 달력 형태로 데이터 구성
  // 요일 순서 설정 (일요일부터 시작)
  const dayOrder = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 달력 컨테이너 생성
  weeklyContainer.innerHTML = '';
  
  // 조식, 중식, 석식 탭 컨테이너 생성
  tabs.forEach(mealType => {
    const mealContainer = document.createElement('div');
    mealContainer.className = `meal-container ${mealType}`;
    mealContainer.id = `meal-${mealType}`;
    mealContainer.style.display = mealType === '중식' ? 'block' : 'none';
    
    // 요일 헤더 생성
    const headerRow = document.createElement('div');
    headerRow.className = 'calendar-row header-row';
    
    dayOrder.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = `calendar-cell header-cell ${day === '토' || day === '일' ? 'weekend' : ''}`;
      dayHeader.textContent = day;
      headerRow.appendChild(dayHeader);
    });
    
    mealContainer.appendChild(headerRow);
    
    // 날짜 계산을 위한 첫 날짜 정보 가져오기
    if (sortedDates.length > 0) {
      const firstDateStr = sortedDates[0];
      const year = parseInt(firstDateStr.split('-')[0]);
      const month = parseInt(firstDateStr.split('-')[1]) - 1;
      const day = parseInt(firstDateStr.split('-')[2]);
      
      const firstDate = new Date(year, month, day);
      const firstDayOfWeek = firstDate.getDay(); // 0: 일요일, 1: 월요일, ...
      
      // 달력 생성
      let currentRow = document.createElement('div');
      currentRow.className = 'calendar-row';
      
      // 첫 주 빈칸 채우기
      for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty-cell';
        currentRow.appendChild(emptyCell);
      }
      
      // 날짜별 셀 생성
      sortedDates.forEach((dateStr, index) => {
        const dateInfo = dateMap[dateStr];
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        
        // 새로운 주 시작
        if (index > 0 && dayOfWeek === 0) {
          mealContainer.appendChild(currentRow);
          currentRow = document.createElement('div');
          currentRow.className = 'calendar-row';
        }
        
        const dateCell = document.createElement('div');
        dateCell.className = `calendar-cell date-cell ${dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : ''}`;
        
        // 날짜 표시
        const dateHeader = document.createElement('div');
        dateHeader.className = 'cell-date';
        dateHeader.textContent = dateStr.split('-')[2]; // 일자만 표시
        dateCell.appendChild(dateHeader);
        
        // 급식 정보 표시
        if (dateInfo.meals[mealType]) {
          const mealInfo = dateInfo.meals[mealType];
          
          // 메뉴 목록
          const menuList = document.createElement('ul');
          menuList.className = 'cell-menu-list';
          
          mealInfo.menu.forEach(item => {
            const menuItem = document.createElement('li');
            menuItem.className = 'cell-menu-item';
            menuItem.textContent = item;
            menuList.appendChild(menuItem);
          });
          
          dateCell.appendChild(menuList);
          
          // 알레르기 정보
          if (mealInfo.allergies && mealInfo.allergies.length > 0) {
            const allergyContainer = document.createElement('div');
            allergyContainer.className = 'cell-allergy-container';
            
            mealInfo.allergies.forEach(allergy => {
              const allergyTag = document.createElement('span');
              allergyTag.className = 'cell-allergy-tag';
              allergyTag.textContent = allergy;
              allergyTag.title = `알레르기 유발 식품: ${allergy}`;
              allergyContainer.appendChild(allergyTag);
            });
            
            dateCell.appendChild(allergyContainer);
          }
        } else {
          const noMeal = document.createElement('p');
          noMeal.className = 'no-meal-cell';
          noMeal.textContent = `${mealType} 없음`;
          dateCell.appendChild(noMeal);
        }
        
        currentRow.appendChild(dateCell);
      });
      
      // 마지막 주 빈칸 채우기
      const lastDateStr = sortedDates[sortedDates.length - 1];
      const lastDate = new Date(lastDateStr);
      const lastDayOfWeek = lastDate.getDay();
      
      for (let i = lastDayOfWeek + 1; i < 7; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty-cell';
        currentRow.appendChild(emptyCell);
      }
      
      // 마지막 주 추가
      mealContainer.appendChild(currentRow);
    }
    
    weeklyContainer.appendChild(mealContainer);
  });
  
  document.getElementById('result').style.display = 'block';
}

// 탭 전환 함수
function switchTab(mealType) {
  // 모든 탭 버튼 비활성화
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.classList.remove('active');
    if (button.textContent === mealType) {
      button.classList.add('active');
    }
  });
  
  // 모든 급식 컨테이너 숨기기
  const mealContainers = document.querySelectorAll('.meal-container');
  mealContainers.forEach(container => {
    container.style.display = 'none';
    if (container.id === `meal-${mealType}`) {
      container.style.display = 'block';
    }
  });
}

// 알레르기 코드표 생성
function createAllergyGrid() {
  const grid = document.getElementById('allergyGrid');
  const ALLERGY_CODES = window.ALLERGY_CODES || {};
  
  for (const [code, name] of Object.entries(ALLERGY_CODES)) {
    const item = document.createElement('div');
    item.className = 'allergy-item';
    
    const codeSpan = document.createElement('span');
    codeSpan.className = 'allergy-code';
    codeSpan.textContent = code;
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    
    item.appendChild(codeSpan);
    item.appendChild(nameSpan);
    grid.appendChild(item);
  }
}

// 페이지 로드 시 알레르기 코드표 생성
window.onload = createAllergyGrid; 