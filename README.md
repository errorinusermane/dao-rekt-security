# 🛡️ DAO-REKT Security: Reentrancy Attack Simulation & Defense

재진입 공격(Reentrancy Attack)을 통한 DAO 해킹 사례를 실습을 통해 재현하고, Solidity와 Hardhat을 이용해 그 방어 방법을 구현한 프로젝트입니다.

---

## 📚 개요

- **사건:** 2016년 DAO 해킹 (360만 ETH 탈취)
- **취약점:** 재진입 공격 (출금 전에 외부 호출 발생)
- **실습 목표:** 실제 공격 방식 구현 + 보안 패턴 적용
- **사용 기술:** Solidity, Hardhat, OpenZeppelin

---

## 🗂 폴더 구조

```
dao-rekt-security/
├── contracts/
│   ├── VulnerableBank.sol     # 취약한 컨트랙트
│   ├── SecureBank.sol         # 보안 적용된 컨트랙트
│   └── Attacker.sol           # 공격자 컨트랙트
│
├── test/
│   ├── reentrancyAttackTest.js        # 재진입 공격 성공 테스트
│   ├── secureBankTest.js              # 보안 컨트랙트 정상 테스트
│   └── secureBankAttackFailTest.js    # 보안 컨트랙트 공격 실패 테스트
│
├── report/
│   ├── report.md              # 보고서
│   └── slides.pdf             # 발표 자료
│
├── scripts/
│   └── deploy.js              # 배포 스크립트
├── .gitignore
├── hardhat.config.js
└── README.md
```

---

## 💥 실습 내용

### 1. 재진입 공격 시나리오 (VulnerableBank)

- 사용자가 10 ETH 입금한 상태에서,  
  공격자가 단 1 ETH로 반복 출금 → 10 ETH 탈취 성공

### 2. 방어 방법 적용 (SecureBank)

- 상태 먼저 갱신 (Checks-Effects-Interactions 패턴)
- 또는 `ReentrancyGuard` 사용
- 공격자 재진입 시도 시 → `revert` 발생 → 자산 보호 성공

---

## 🧪 실행 방법

```bash
# 의존성 설치
npm install

# 테스트 실행
npx hardhat test
```

---

## ✅ 테스트 결과 예시

💥 Reentrancy Attack Test
공격자 컨트랙트 잔액: 11.0 ETH
✔ 💸 공격자가 재진입 공격으로 잔액을 탈취할 수 있어야 한다

🛡️ SecureBank - 재진입 공격 방어 테스트
✔ 공격자가 공격을 시도해도 트랜잭션이 revert되어야 한다

✅ SecureBank - 정상 입출금 테스트
✔ 사용자가 입금 후 출금하면 잔액이 0이 되어야 한다

---

## 📌 학습 포인트

- 스마트 컨트랙트에서 `call.value()` 호출의 위험성
- Solidity 보안 패턴 적용 방법 실습
- 실제 해킹 사례를 코드로 재현하며 체득한 보안 감수성

---

## 📎 참고

- [Making Smart Contracts Smarter (Luu et al., 2016)](https://arxiv.org/abs/1608.06993)
- [The DAO Hack Explained – NYTimes](https://www.nytimes.com/2016/06/18/business/dealbook/hacker-may-have-removed-more-than-50-million-from-experimental-cybercurrency-project.html)
- [OpenZeppelin ReentrancyGuard](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard)
