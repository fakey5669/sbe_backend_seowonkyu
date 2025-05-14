//실행법 npm start

// 주어진 숫자 배열
const numbers: number[] = [1, 3, 5, 7, 9];


/*
&이해를 돕기 위한 설명
getPermutations([1, 3, 5, 7, 9], 2) 호출
  └─ permute([], [1, 3, 5, 7, 9])
     └─ permute([1], [3, 5, 7, 9])
        └─ permute([1, 3], [5, 7, 9]) → length = 2 만족, result=[[1, 3]], return → permute([1], [3, 5, 7, 9])의 for 루프 (i=1)로
        └─ permute([1, 5], [3, 7, 9]) → length = 2 만족, result=[[1, 3], [1, 5]], return → permute([1], [3, 5, 7, 9])의 for 루프 (i=2)로
        └─ permute([1, 7], [3, 5, 9]) → length = 2 만족, result=[[1, 3], [1, 5], [1, 7]], return → permute([1], [3, 5, 7, 9])의 for 루프 (i=3)로
        └─ permute([1, 9], [3, 5, 7]) → length = 2 만족, result=[[1, 3], [1, 5], [1, 7], [1, 9]], return → permute([], [1, 3, 5, 7, 9])의 for 루프 (i=1)로
     
     └─ permute([3], [1, 5, 7, 9])
        └─ permute([3, 1], [5, 7, 9]) → length = 2 만족, result=[[1, 3], [1, 5], [1, 7], [1, 9], [3, 1]], return → permute([3], [1, 5, 7, 9])의 for 루프 (i=1)로
        └─ permute([3, 5], [1, 7, 9]) → length = 2 만족, result=[[1, 3], [1, 5], [1, 7], [1, 9], [3, 1], [3, 5]], return → permute([3], [1, 5, 7, 9])의 for 루프 (i=2)로
        └─ permute([3, 7], [1, 5, 9]) → length = 2 만족, result=[[1, 3], [1, 5], [1, 7], [1, 9], [3, 1], [3, 5], [3, 7]], return → permute([3], [1, 5, 7, 9])의 for 루프 (i=3)로
        └─ permute([3, 9], [1, 5, 7]) → length = 2 만족, result=[[1, 3], [1, 5], [1, 7], [1, 9], [3, 1], [3, 5], [3, 7], [3, 9]], return → permute([], [1, 3, 5, 7, 9])의 for 루프 (i=2)로
     
     └─ permute([5], [1, 3, 7, 9])
        └─ permute([5, 1], [3, 7, 9]) → length = 2 만족, result에 [5, 1] 추가, return → permute([5], [1, 3, 7, 9])의 for 루프 (i=1)로
        └─ permute([5, 3], [1, 7, 9]) → length = 2 만족, result에 [5, 3] 추가, return → permute([5], [1, 3, 7, 9])의 for 루프 (i=2)로
        └─ permute([5, 7], [1, 3, 9]) → length = 2 만족, result에 [5, 7] 추가, return → permute([5], [1, 3, 7, 9])의 for 루프 (i=3)로
        └─ permute([5, 9], [1, 3, 7]) → length = 2 만족, result에 [5, 9] 추가, return → permute([], [1, 3, 5, 7, 9])의 for 루프 (i=3)로
     
     └─ permute([7], [1, 3, 5, 9])
        └─ ... (비슷한 과정 반복)
     
     └─ permute([9], [1, 3, 5, 7])
        └─ ... (비슷한 과정 반복)
*/

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

// 주어진 숫자로 가능한 가장 큰 수를 만드는 함수
function makeMaxNumber(arr: number[]): number {
  // 내림차순으로 정렬하여 가장 큰 수 만들기
  const sortedArr = [...arr].sort((a, b) => b - a);
  return arrayToNumber(sortedArr);
}

// 가능한 모든 두 수의 조합과 그 곱을 계산하는 함수 (최적화 버전)
function findMaxProduct(): { pair: [number, number] } {
  let maxProduct = 0;
  let maxPair: [number, number] = [0, 0];
  
  // 1:4 2:3 3:2 4:1 이렇게 4가지 경우만 있어 첫번 째 숫자를 2자리까지만 검사하면 모든 경우의 수 가능
  for (let firstLength = 1; firstLength <= 2; firstLength++) {
    // 첫 번째 숫자의 모든 가능한 순열
    const firstPermutations = getPermutations(numbers, firstLength);
    
    for (const firstPerm of firstPermutations) {
      const firstNum = arrayToNumber(firstPerm);
      
      // 사용하지 않은 숫자들
      const remainingDigits = numbers.filter(n => !firstPerm.includes(n));
      
      // 남은 숫자들로 가장 큰 수 만들기
      const secondNum = makeMaxNumber(remainingDigits);
      const product = firstNum * secondNum;
      
      // 최대 곱 업데이트
      if (product > maxProduct) {
        maxProduct = product;
        maxPair = [firstNum, secondNum];
      }
    }
  }
  
  return { pair: maxPair };
}

// 결과 계산 및 출력
const result = findMaxProduct();
console.log(`result: ${result.pair[0]}, ${result.pair[1]}`); 