/**
 * 사용 가능한 숫자: 1, 3, 5, 7, 9
 * 각 숫자는 한 번만 사용 가능
 * 숫자들을 조합해서 두 수를 만들고, 그 곱이 최대인 경우 찾기
 */

// 주어진 숫자 배열
const numbers: number[] = [1, 3, 5, 7, 9];

// 모든 가능한 순열을 구하는 함수
function getPermutations(arr: number[], length: number): number[][] {
  const result: number[][] = [];
  
  // 재귀 헬퍼 함수
  function permute(current: number[], remaining: number[]): void {
    // 현재 순열이 원하는 길이에 도달했으면 결과에 추가
    if (current.length === length) {
      result.push([...current]);
      return;
    }
    
    // 남은 숫자들에 대해 순열 생성
    for (let i = 0; i < remaining.length; i++) {
      const newCurrent = [...current, remaining[i]];
      const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
      permute(newCurrent, newRemaining);
    }
  }
  
  permute([], arr);
  return result;
}

// 배열을 하나의 숫자로 변환하는 함수 (예: [1, 3, 5] -> 135)
function arrayToNumber(arr: number[]): number {
  return parseInt(arr.join(''));
}

// 가능한 모든 두 수의 조합과 그 곱을 계산하는 함수
function findMaxProduct(): { pair: [number, number], product: number } {
  let maxProduct = 0;
  let maxPair: [number, number] = [0, 0];
  
  // 1부터 4자리까지의 모든 가능한 숫자 길이 조합 검사
  for (let firstLength = 1; firstLength <= 4; firstLength++) {
    const secondLength = 5 - firstLength; // 두 번째 숫자의 길이
    
    // 첫 번째 숫자의 모든 가능한 순열
    const firstPermutations = getPermutations(numbers, firstLength);
    
    for (const firstPerm of firstPermutations) {
      const firstNum = arrayToNumber(firstPerm);
      
      // 사용하지 않은 숫자들
      const remainingDigits = numbers.filter(n => !firstPerm.includes(n));
      
      // 두 번째 숫자의 모든 가능한 순열
      const secondPermutations = getPermutations(remainingDigits, secondLength);
      
      for (const secondPerm of secondPermutations) {
        const secondNum = arrayToNumber(secondPerm);
        const product = firstNum * secondNum;
        
        // 최대 곱 업데이트
        if (product > maxProduct) {
          maxProduct = product;
          maxPair = [firstNum, secondNum];
        }
      }
    }
  }
  
  return { pair: maxPair, product: maxProduct };
}

// 결과 계산 및 출력
const result = findMaxProduct();
console.log(`result: ${result.pair[0]}, ${result.pair[1]}`); 