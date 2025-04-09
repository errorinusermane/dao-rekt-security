
# 🛡️ 이더리움과 스마트 컨트랙트 보안 이슈 및 해결방안

**이화체인 베이직 스터디**  
15기 임수지

---

## 1. 서론: 스마트 컨트랙트 보안의 중요성

스마트 컨트랙트는 블록체인 위에서 자동으로 실행되는 프로그램으로, 탈중앙화된 환경에서 신뢰 없이 계약을 이행할 수 있게 한다.

특히 이더리움 네트워크에서는 수많은 디앱(DApp)이 스마트 컨트랙트를 기반으로 운영되며, 이들 중 상당수는 자산을 직접 다루기 때문에 보안 취약점은 곧 막대한 금전적 피해로 직결된다.

> 📚 Luu et al. (2016)의 *"Making Smart Contracts Smarter"*에서는 약 8,859개의 이더리움 컨트랙트를 분석한 결과,  
> 재진입(Reentrancy), 시간 의존성(Time Dependency), 예외 취약성(Unhandled Exception) 등  
> 다양한 보안 문제가 존재함을 밝혔다.  
> 이는 스마트 컨트랙트의 구조적 특성상 보안 결함에 특히 민감함을 보여준다.

---

## 2. 사례 분석: DAO 해킹과 재진입 공격 (Reentrancy Attack)

### 🏛️ DAO란?

DAO(Decentralized Autonomous Organization)는 탈중앙화된 자율조직으로,  
투자자들이 스마트 컨트랙트를 통해 자금을 모으고, 제안에 투표하여 투자 결정을 내릴 수 있도록 설계되었다.

> 당시 DAO는 이더리움 전체 유통량의 약 14%를 유치할 정도로 큰 주목을 받았다.

하지만 DAO의 스마트 컨트랙트에는 **구조적인 결함**이 있었고,  
이로 인해 사상 초유의 해킹 사건이 발생하게 된다.

---

### 🧨 DAO 해킹의 핵심: 재진입 공격 (Reentrancy Attack)

재진입 공격은 아래와 같은 취약한 withdraw 함수에서 발생했다.

```solidity
function withdraw(uint amount) public {
    if (balances[msg.sender] >= amount) {
        msg.sender.call.value(amount)(); // 외부 호출 (fallback 트리거)
        balances[msg.sender] -= amount;  // 이후 잔액 차감 → 문제 발생
    }
}
```

#### 🔥 공격 방식 요약

1. 공격자가 자신의 컨트랙트에 `fallback()` 혹은 `receive()` 함수를 구현해 둔다.
2. `withdraw()` 실행 중 `msg.sender.call.value()`로 인해 해당 fallback 함수가 실행된다.
3. fallback에서 다시 `withdraw()`를 호출 → 아직 잔액이 차감되지 않았기 때문에 또 출금된다.
4. 이 과정이 재귀적으로 반복되어, **실제 잔액보다 더 많은 금액**을 탈취할 수 있게 된다.

결과적으로 DAO의 전체 자금 중 **약 1/3에 해당하는 360만 ETH가 탈취**되었으며,  
이더리움 커뮤니티는 이를 복구하기 위해 **하드포크**라는 극단적인 선택을 하게 된다.

---

## 3. 실습: 재진입 공격 재현 및 방어

### 🔬 실험 구성

| 역할 | 파일 |
|------|------|
| 피해 컨트랙트 | `VulnerableBank.sol` |
| 공격자 컨트랙트 | `Attacker.sol` |
| 보안 컨트랙트 | `SecureBank.sol` |
| 실행 환경 | Hardhat + Ethers.js v6 |

---

### ✅ 방어 방법 1: Checks-Effects-Interactions 패턴

```solidity
function withdraw() public {
    uint amount = balances[msg.sender];
    require(amount > 0, "Insufficient balance");

    balances[msg.sender] = 0; // 상태 먼저 변경

    (bool sent, ) = msg.sender.call{value: amount}("");
    require(sent, "Failed to send Ether");
}
```

→ **상태값을 먼저 변경**함으로써 이후 재호출 시 출금할 수 없게 만든다.

---

### ✅ 방어 방법 2: ReentrancyGuard 사용

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SecureBank is ReentrancyGuard {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public nonReentrant {
        uint amount = balances[msg.sender];
        require(amount > 0, "Insufficient balance");

        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}
```

→ `nonReentrant` modifier가 **중첩 호출을 자동 차단**하여, 공격자의 재귀적 호출을 막아준다.

---

### 🧪 실험 결과 요약

| 항목 | 결과 |
|------|------|
| 공격자 공격 시도 | **트랜잭션 reverted** |
| 자산 보호 | **입금된 10 ETH 그대로 유지됨** |
| 공격자 컨트랙트 잔액 | **0 ETH** |
| 테스트 통과 여부 | `3 passing` 확인 ✅ |

> 단순한 코드 수정만으로도 해킹을 완벽히 막을 수 있었다는 점에서  
> 실무적으로도 매우 의미 있는 결과다.

---

## 4. 결론 및 실무 적용 방안

DAO 해킹 사례는 **스마트 컨트랙트의 작은 실수 하나가 치명적인 피해**로 이어질 수 있음을 보여준다.  
특히 재진입 공격은 초보 개발자가 **실수하기 쉬운 구조**에서 자주 발생한다.

### ✔️ 실무에서 꼭 지켜야 할 보안 원칙

- ✅ 상태값 갱신은 항상 **외부 호출보다 먼저**
- ✅ OpenZeppelin의 **보안 라이브러리 적극 활용**
- ✅ 배포 전 **Slither, Mythril 등 정적 분석 도구**로 감수

---

## ✨ 마무리하며

이번 실습을 통해 단순히 기능을 구현하는 것을 넘어,  
**보안까지 고려한 스마트 컨트랙트 개발이 얼마나 중요한지** 체감할 수 있었다.

작은 코드 한 줄이 수백억 원의 피해를 막을 수도 있다는 점에서,  
**스마트 컨트랙트 보안은 선택이 아닌 필수**임을 다시금 느낄 수 있었다.
